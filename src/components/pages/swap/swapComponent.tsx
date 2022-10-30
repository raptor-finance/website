import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { RaptorChainInterface } from '../../contracts/chain';
import { RaptorSwap, Chains, Assets } from '../../contracts/raptorswap';

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
	valueIn?: string,
	valueOut?: string,
	assetIn?: string,
	assetOut?: string,
	balanceIn?: number,
	balanceOut?: number,
	currentChain?: string
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class SwapComponent extends BaseComponent<RaptorSwapProps & withTranslation, RaptorSwapState> {
	
	private lock: boolean;
	
	constructor(props: RaptorSwapProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.handleAssetInUpdate = this.handleAssetInUpdate.bind(this);
		this.handleAssetOutUpdate = this.handleAssetOutUpdate.bind(this);
		this.selectNetwork = this.selectNetwork.bind(this);
		this.refreshBalances = this.refreshBalances.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
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

			await this.updateState({ wallet: wallet, chain: chain, swap: swap, address: wallet.currentAddress, looping: true, pending: false, ctValue: 0, assetIn: "RPTR", assetOut: "0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32"});
			this.updateOnce(true).then();
			this.refreshBalances();

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
		const state = this.readState();
		let tokens = event.target.value;
		const valueOut = await this.readState().swap.getOutput(tokens, state.assetIn, state.assetOut);
		this.updateState({ valueIn:tokens, valueOut: valueOut });
	}
	
	async handleAmountOutUpdate(event) {
		const state = this.readState();
		let tokens = event.target.value;
		let valueIn = await this.readState().swap.getInput(tokens, state.assetIn, state.assetOut);
		this.updateState({ valueOut:tokens, valueIn: valueIn });
	}

	async refreshBalances() {
		const state = this.readState();
		const _balanceIn = await state.swap.assetBalance(state.assetIn);
		const _balanceOut = await state.swap.assetBalance(state.assetOut);
		this.updateState({balanceIn: _balanceIn, balanceOut: _balanceOut});
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
		switch (state.assetIn) {
			case "RPTR":
				this.updateState({valueIn: (state.balanceIn - 500)});
				break;
			default:
				this.updateState({valueIn: state.balanceIn});
		}
	}
	
	// setMaxDepositAmount() {
		// const state = this.readState();
		// this.updateState({ ctValue: ((!!state.raptor) ? state.raptor.balancev3 : 0) });
	// }
	
	// setMaxWithdrawalAmount() {
		// const state = this.readState();
		// this.updateState({ ctValue: ((!!state.chain) ? state.chain.balance : 0) });
	// }
	
	async swap() {
		let state = this.readState();
		console.log(state);
		await state.chain.refresh();
		await state.swap.swap(state.valueIn, state.assetIn, state.assetOut);
		await this.refreshBalances();
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
	
	async selectNetwork(event) {
		await this.updateState({ currentChain: event.target.value });
	}
	
	assetDisplay(_asset) {
		return <>
			<option value={_asset.contract}>{_asset.symbol}</option>
		</>
	}

	assetList() {
		// return <>
			// <option value="RPTR">RPTR</option>
			// <option value="0x9ffE5c6EB6A8BFFF1a9a9DC07406629616c19d32">rDUCO</option>
		// </>
		
		return <>
			{Assets.map(this.assetDisplay)}
		</>
	}
	
	assetSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.assetList()}
			</select>
		</>
	}
	
	chainChoice(_d) {
		return <option value={_d.chainid}>{_d.name}</option>
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
							<select value={state.currentChain} onchange={state.selectNetwork} className="float-right">
								{Chains.map(this.chainChoice)}
							</select>
					        </div>
				     </div>
		       	</div>


				<div className="container">
                    <FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<div className="container shadow addLiquidityCard gradient-card">
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
								<br/>
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