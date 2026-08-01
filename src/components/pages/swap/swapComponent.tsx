import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet } from '../../wallet';
import { RaptorChainInterface } from '../../contracts/chain';
import { RaptorSwap } from '../../contracts/raptorswap';
import { CHAIN } from '../../../config';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import '../../../theme/custom.css';
import './migrationComponent.css';
import './stakingComponent.css';
import './swapComponent.css'
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type RaptorSwapProps = {};
export type RaptorSwapState = WalletPageState & {
	chain?: RaptorChainInterface,
	swap?: RaptorSwap,
	valueIn?: string,
	valueOut?: string,
	assetIn?: string,
	assetOut?: string,
	balanceIn?: number,
	balanceOut?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class SwapComponent extends WalletPageBase<RaptorSwapProps & WithTranslation, RaptorSwapState> {
	
	constructor(props: RaptorSwapProps & WithTranslation) {
		super(props);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.handleAssetInUpdate = this.handleAssetInUpdate.bind(this);
		this.handleAssetOutUpdate = this.handleAssetOutUpdate.bind(this);
		this.refreshBalances = this.refreshBalances.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.swap = this.swap.bind(this);
		this.state = {} as RaptorSwapState;
	}
	
	protected get pollIntervalMs(): number {
		return 1000;
	}

	protected get connectChainId(): number {
		return CHAIN.RAPTORCHAIN;
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const chain = new RaptorChainInterface(wallet, "https://rpc.raptorchain.io/");
		const swap = new RaptorSwap(wallet);
		this.updateState({ chain: chain, swap: swap, address: wallet.currentAddress, looping: true, valueIn: "", valueOut: "", assetIn: "RPTR", assetOut: "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32" });
		await this.refreshBalances();
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
		const state = this.readState();
		if (!state.swap) {
			return false;
		}
		try {
			if (!this.readState().looping) {
				return false;
			}
			await this.refreshBalances();
			return true;
		}
		catch (e) {
			console.warn('Unable to update swap status', e);
			return false;
		}
	}

	protected resetState(): void {
		this.updateState({ chain: null, swap: null });
	}
	
	async handleAmountUpdate(event) {
		const state = this.readState();
		let tokens = event.target.value;
		const valueOut = await this.readState().swap.getOutput(tokens, state.assetIn, state.assetOut);
		this.updateState({ valueIn: tokens, valueOut: valueOut });
	}
	
	async handleAmountOutUpdate(event) {
		const state = this.readState();
		let tokens = event.target.value;
		let valueIn = await this.readState().swap.getInput(tokens, state.assetIn, state.assetOut);
		this.updateState({ valueOut: tokens, valueIn: valueIn });
	}

	async refreshBalances() {
		const state = this.readState();
		const _balanceIn = await state.swap.assetBalance(state.assetIn);
		const _balanceOut = await state.swap.assetBalance(state.assetOut);
		this.updateState({ balanceIn: _balanceIn, balanceOut: _balanceOut });
	}

	async handleAssetInUpdate(event) {
		const state = this.readState();
		const _asset = event.target.value;
		console.log(`Asset in : ${_asset}`);
		const _assetOut = (_asset == state.assetOut) ? state.assetIn : state.assetOut;
		await this.updateState({ assetIn: _asset, assetOut: _assetOut });
		this.refreshBalances();
	}

	async handleAssetOutUpdate(event) {
		const state = this.readState();
		const _asset = event.target.value;
		const _assetIn = (_asset == state.assetIn) ? state.assetOut : state.assetIn;
		await this.updateState({ assetIn: _assetIn, assetOut: _asset });
		this.refreshBalances();
	}
	
	setMaxAmount() {
		const state = this.readState();
		// keep a small buffer so the tx doesn't fail on rounding (gas token case)
		this.updateState({ valueIn: (state.assetIn == "RPTR" ? (state.balanceIn - 500) : state.balanceIn) });
	}
	
	async swap() {
		let state = this.readState();
		await state.swap.swap(state.valueIn, state.assetIn, state.assetOut);
		await this.refreshBalances();
		await this.refreshOnce(true);
	}
	
	assetDisplay(assetName, contractAddr) {
		return <>
			<option value={contractAddr}>{assetName}</option>
		</>
		
	}

	assetList() {
		return <>
			{this.assetDisplay("RPTR", "RPTR")}
			{this.assetDisplay("rDUCO", "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32")}
		</>
	}
	
	assetSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.assetList()}
			</select>
		</>
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">

			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
						<div className="migration-title">
							<b><font size="6"><span>Raptor</span><span style={{ color: "#31c461" }}>Swap</span></font></b>
							<WalletConnectButton
								connected={!!state.address}
								pending={state.pending}
								onConnect={this.connectWallet}
								onDisconnect={this.disconnectWallet}
							/>
						</div>
					</div>
				</div>


				<div className="container">
					<FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary smoothDiv">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<div className="container shadow addLiquidityCard gradient-card smoothDiv swapSubDiv">
								<h2>Swap</h2>
								<p>Enter the amount that you want to swap:</p>
								<div>
									{this.assetSelector(state.assetIn, this.handleAssetInUpdate)}
									Balance : {state.balanceIn}
								</div>
								<div>
									<input type="number" className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.valueIn}></input>&nbsp;
									<button onClick={this.setMaxAmount} className="btn btn-md btn-primary">Max</button>
								</div>
								<div>
									{this.assetSelector(state.assetOut, this.handleAssetOutUpdate)}
									Balance : {state.balanceOut}
								</div>
								<div>
									<input type="number" className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountOutUpdate} value={state.valueOut}></input>
								</div>
								<br />
								<div className="d-flex justify-content-center button-row">
									<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.swap}>Swap</button>
								</div>
							</div>
						</div>


					</FadeInLeftDiv>

					<div className="migration-footer">
						<font size="2"><i>Note : RaptorSwap is still in beta ! Be one of the first to try it :D</i></font>
					</div>
				</div>


			</div>
		</div>
	}
}

export default withTranslation()(SwapComponent);