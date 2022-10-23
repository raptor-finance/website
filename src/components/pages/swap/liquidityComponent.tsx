import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { RaptorChainInterface } from '../../contracts/chain';
import { RaptorSwap } from '../../contracts/raptorswap';

import './migrationComponent.css';
import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type RaptorSwapProps = {};
export type RaptorSwapState = {
	wallet?: Wallet,
	chain?: RaptorChainInterface,
	swap?: RaptorSwap,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	amountA?: number,
	amountB?: number,
	assetA?: string,
	assetB?: string,
	balanceA?: number,
	balanceB?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class LiquidityComponent extends BaseComponent<RaptorSwapProps & withTranslation, RaptorSwapState> {
	
	private lock: boolean;
	
	constructor(props: RaptorSwapProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.swap = this.swap.bind(this);
		// this.setMaxDepositAmount = this.setMaxDepositAmount.bind(this);
		// this.setMaxWithdrawalAmount = this.setMaxWithdrawalAmount.bind(this);
		this.state = {};
	}
	
	handleError(error) {
		ShellErrorHandler.handle(error);
	}
	
	private async loop(): Promise<void> {
		const self = this;
		const cont = await self.updateOnce.call(self);

		if (cont) {
			this._timeout = setTimeout(async () => await self.loop.call(self), 1000);
		}
	}
	
	private async updateOnce(resetCt?: boolean): Promise<boolean> {
	}
	
	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect(0x52505452);
			const chain = new RaptorChainInterface(wallet, "https://rpc.raptorchain.io/");
			const swap = new RaptorSwap(wallet);

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

//			const raptor = new Raptor(wallet);

			this.updateState({ wallet: wallet, chain: chain, swap: swap, address: wallet.currentAddress, looping: true, pending: false, ctValue: 0, assetA: "RPTR", assetB: "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32" });
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
			throw e;
		}
	}

	async disconnectWallet() {
		try {
			this.updateState({ pending: true });
			const result = await this.state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}

			this.updateState({ raptor: null, wallet: null, chain: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}
	
	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
		  this.connectWallet();
		}
	}

	componentWillUnmount() {
	}
	
	async handleAmountUpdate(event) {
		let tokens = event.target.value;
		const valueOut = await this.readState().swap.getOutput(tokens, "RPTR", "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32");
		this.updateState({ valueIn:tokens, valueOut: valueOut });
	}
	
	async handleAmountOutUpdate(event) {
		let tokens = event.target.value;
		let valueIn = await this.readState().swap.getInput(tokens, "RPTR", "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32");
		this.updateState({ valueOut:tokens, valueIn: valueIn });
	}
	
	async refreshBalances() {
		// TODO : add stuff to catch asset A/B balances
	}
	
	async handleAssetAUpdate(event) {
		const _asset = event.target.value;
		console.log(`Asset A : ${_asset}`);
		await this.updateState({ assetA: _asset });
		this.refreshBalances();
	}

	async handleAssetBUpdate(event) {
		const _asset = event.target.value;
		await this.updateState({ assetB: _asset });
		this.refreshBalances();
	}
	
	
	
	async swap() {
		let state = this.readState();
		console.log(state);
		await state.chain.refresh();
		await state.swap.swap(state.valueIn, state.assetA, state.assetB);
		this.updateOnce(true);
	}
	
	async addTestnetToMetamask() {
		const networkinfo = [{
			chainId: '0x7452505452',
			chainName: 'RaptorChain v0.4 testnet',
			nativeCurrency:
			{
				name: 'Testnet RPTR',
				symbol: 'tRPTR',
				decimals: 18
			},
			rpcUrls: ['https://rptr-testnet-1.dynamic-dns.net/web3'],
			blockExplorerUrls: null,
		}]
		await ethereum.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () { throw 'Failed adding RaptorChain Testnet to metamask' })
	}
	
	assetDisplay(assetName, contractAddr) {
		return <>
			<option value={contractAddr}>{assetName}</option>
		</>
		
	}

	assetList() {
		// return <>
			// <option value="RPTR">RPTR</option>
			// <option value="0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32">rDUCO</option>
		// </>
		
		return <>
			{this.assetDisplay("RPTR", "RPTR")}
			{this.assetDisplay("rDUCO", "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32")}
		</>
	}

	async updateAssets(token0, token1) {
		await this.updateState({assetA: token0, assetB: token1});
		this.refreshBalances();
	}
	pairDisplay(pair) {
		return <div className="container">
			<div>
				{numeral(pair.formattedLpBalance).format("0.00")} LP
			</div>
			<div>
				{numeral(pair.formattedBalance0).format("0.00")} {pair.ticker0}
			</div>
			<div>
				{numeral(pair.formattedBalance1).format("0.00")} {pair.ticker1}
			</div>
			<button onClick={() => this.selectAsset(pair.token0, pair.token1)}><select>
		</div>
	}
	
	renderPairsList() {
		const state = this.readState();
		try {
			if (state.address) {
				console.log(state.swap.pairs[0]);
				return this.pairDisplay(state.swap.pairs[0]);
			} else {
				return <></>
			}
		} catch (e) {
			console.error(e);
			return <></>
		}
	}
	
	assetSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.assetList()}
			</select>
		</>
	}

	render() {
		this.updateOnce(false);
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">

			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
							<div className="migration-title">
							<b><font size="6"><span>Raptor</span><span style={{ color: "#31c461" }}>Swap</span></font></b>
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.disconnectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									Disconnect wallet
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.connectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									Connect wallet
								</a>)
							}
					        </div>
				     </div>
		       	</div>


				<div className="container">
                    <FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<h2>Balance breakdown</h2>
							<div>
								{this.assetSelector(state.assetA, this.handleAssetAUpdate)}
								Balance : {state.balanceA}
							</div>
							<div>
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.valueIn}></input>
                            </div>
							<div>
								{this.assetSelector(state.assetB, this.handleAssetBUpdate)}
								Balance : {state.balanceB}
							</div>
							<div>
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountOutUpdate} value={state.valueOut}></input>
                            </div>
							<br/>
                            <div className="d-flex justify-content-center button-row">
					         	<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.swap}>Add Liquidity</button>
					        </div>
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