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
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type RaptorSwapProps = {};
export type RaptorSwapState = WalletPageState & {
	chain?: RaptorChainInterface,
	swap?: RaptorSwap,
	amountA?: string,
	amountB?: string,
	amountLPTokens?: string,
	assetA?: string,
	assetB?: string,
	balanceA?: number,
	balanceB?: number,
	selectedPair?: any,
	sequenceNumber?: number // 0 = add LP, 1 = withdraw
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class LiquidityComponent extends WalletPageBase<RaptorSwapProps & WithTranslation, RaptorSwapState> {
	
	constructor(props: RaptorSwapProps & WithTranslation) {
		super(props);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.handleLPAmountUpdate = this.handleLPAmountUpdate.bind(this);
		this.handleAssetAUpdate = this.handleAssetAUpdate.bind(this);
		this.handleAssetBUpdate = this.handleAssetBUpdate.bind(this);
		this.updateAssets = this.updateAssets.bind(this);
		this.withdrawAssets = this.withdrawAssets.bind(this);
		this.renderAddLiquidity = this.renderAddLiquidity.bind(this);
		this.renderRemoveLiquidity = this.renderRemoveLiquidity.bind(this);
		this.switchToRemoveLiquidity = this.switchToRemoveLiquidity.bind(this);
		this.switchToAddLiquidity = this.switchToAddLiquidity.bind(this);
		this.liquify = this.liquify.bind(this);
		this.removeLP = this.removeLP.bind(this);
		this.pairDisplay = this.pairDisplay.bind(this);
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
		this.updateState({ chain: chain, swap: swap, address: wallet.currentAddress, looping: true, assetA: "RPTR", assetB: "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32", sequenceNumber: 0 });
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
			console.warn('Unable to update liquidity status', e);
			return false;
		}
	}

	protected resetState(): void {
		this.updateState({ chain: null, swap: null });
	}
	
	async handleAmountUpdate(event) {
		const state = this.readState();
		let tokens = event.target.value;
		console.log(state.selectedPair);
		const _amtB = state.selectedPair.getOtherAmount(state.assetA, tokens);
		this.updateState({ amountA: tokens, amountB: _amtB });
	}
	
	async handleAmountOutUpdate(event) {
		const state = this.readState();
		let tokens = event.target.value;
		const _amtA = state.selectedPair.getOtherAmount(state.assetB, tokens);
		this.updateState({ amountB: tokens, amountA: _amtA });
	}
	
	handleLPAmountUpdate(event) {
		this.updateState({ amountLPTokens: event.target.value });
	}
	
	async refreshBalances() {
		const state = this.readState();
		await this.updateCurrentPair();
		const _balanceA = await state.swap.assetBalance(state.assetA);
		const _balanceB = await state.swap.assetBalance(state.assetB);
		await this.updateState({ balanceA: _balanceA, balanceB: _balanceB });
		await state.swap.refreshPairs();
	}
	
	async handleAssetAUpdate(event) {
		const state = this.readState();
		const _asset = event.target.value;
		console.log(`Asset A : ${_asset}`);
		const _assetB = (_asset == state.assetB) ? state.assetA : state.assetB;
		await this.updateState({ assetA: _asset, assetB: _assetB });
		this.refreshBalances();
	}

	async handleAssetBUpdate(event) {
		const state = this.readState();
		const _asset = event.target.value;
		const _assetA = (_asset == state.assetA) ? state.assetB : state.assetA;
		await this.updateState({ assetA: _assetA, assetB: _asset });
		this.refreshBalances();
	}
	
	async updateCurrentPair() {
		const state = this.readState();
		const _pair = (await state.swap.pairFor(state.assetA, state.assetB));
		console.log(_pair);
		await this.updateState({ selectedPair: _pair });
		await _pair.setupPromise;
	}
	
	async liquify() {
		let state = this.readState();
		await state.swap.liquify(state.amountA, state.amountB, state.assetA, state.assetB);
		await this.refreshBalances();
		await this.refreshOnce(true);
	}
	
	async removeLP() {
		let state = this.readState();
		await state.swap.removeLP(state.amountLPTokens, state.assetA, state.assetB);
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
	
	async switchToAddLiquidity() {
		await this.updateState({ sequenceNumber: 0 });
		this.refreshBalances();
	}
	
	async switchToRemoveLiquidity() {
		await this.updateState({ sequenceNumber: 1 });
		this.refreshBalances();
	}

	async updateAssets(token0, token1) {
		await this.updateState({ assetA: token0, assetB: token1, sequenceNumber: 0 });
		this.refreshBalances();
	}
	
	async withdrawAssets(token0, token1) {
		await this.updateState({ assetA: token0, assetB: token1, sequenceNumber: 1 });
		this.refreshBalances();
	}
	
	pairDisplay(pair) {
		return <div className="container shadow lppair gradient-card">
			<div>
				<div>
					{numeral(pair.formattedBalance0).format("0.00")} {pair.ticker0}&nbsp;
					{numeral(pair.formattedBalance1).format("0.00")} {pair.ticker1}&nbsp;
					{numeral(pair.formattedLpBalance).format("0.00")} {pair.ticker0}/{pair.ticker1} LP
				</div>
				<div>
					<button className="btn btn-primary" onClick={() => this.updateAssets(pair.token0, pair.token1)}>Add liquidity</button>&nbsp;
					<button className="btn btn-primary" onClick={() => this.withdrawAssets(pair.token0, pair.token1)}>Remove liquidity</button>
				</div>
			</div>
		</div>
	}
	
	renderPairsList() {
		const state = this.readState();
		return (state.swap ? state.swap.pairs.map(this.pairDisplay) : undefined);
	}
	
	assetSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.assetList()}
			</select>
		</>
	}
	
	getEstWdAmt() {
		const state = this.readState();
		return <div>
			You will get {state.selectedPair.getPooledAmount(state.assetA, state.amountA)} {state.selectedPair}
		</div>
	}
	
	renderAddLiquidity() {
		const state = this.readState();
		return <div className="container shadow addLiquidityCard gradient-card smoothDiv">
			<h2>Add Liquidity</h2>
			<div>
				{this.assetSelector(state.assetA, this.handleAssetAUpdate)}&nbsp;
				Balance : {state.balanceA}
			</div>
			<div>
				<input type="number" className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.amountA}></input>
			</div>
			<div>
				{this.assetSelector(state.assetB, this.handleAssetBUpdate)}&nbsp;
				Balance : {state.balanceB}
			</div>
			<div>
				<input type="number" className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountOutUpdate} value={state.amountB}></input>
			</div>
			<br />
			<div className="d-flex justify-content-center button-row">
				<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.liquify}>Add Liquidity</button>&nbsp;
				<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.switchToRemoveLiquidity}>Remove Liquidity Instead</button>
			</div>
		</div>
	}

	renderRemoveLiquidity() {
		const state = this.readState();
		const _pair = state.selectedPair;
		const _lpBalance = _pair ? _pair.formattedLpBalance : 0;
		console.log(`LP balance : ${_lpBalance}`)
		return <div className="container shadow addLiquidityCard gradient-card smoothDiv">
			<h2>Remove Liquidity</h2>
			<div>
				{this.assetSelector(state.assetA, this.handleAssetAUpdate)}&nbsp;
				Balance : {state.balanceA}
			</div>
			<div>
				{this.assetSelector(state.assetB, this.handleAssetBUpdate)}&nbsp;
				Balance : {state.balanceB}
			</div>
			<div>
				LP Balance : {_lpBalance}
			</div>
			<div>
				<input type="number" className="input-amount" placeholder="Enter LP amount..." onChange={this.handleLPAmountUpdate} value={state.amountLPTokens}></input>
			</div>
			<br />
			<div className="d-flex justify-content-center button-row">
				<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.removeLP}>Remove Liquidity</button>&nbsp;
				<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.switchToAddLiquidity}>Add Liquidity Instead</button>
			</div>
		</div>
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
							{(!state.sequenceNumber) ? this.renderAddLiquidity() : this.renderRemoveLiquidity()}
							{this.renderPairsList()}
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

export default withTranslation()(LiquidityComponent);