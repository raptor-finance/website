import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet, ReadOnlyProvider } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { RaptorChainInterface } from '../../contracts/chain';

import './migrationComponent.css';
import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type CrossChainProps = {};
export type CrossChainState = {
	raptor?: Raptor,
	wallet?: Wallet,
	polygon?: ReadOnlyProvider,
	bsc?: ReadOnlyProvider,
	chain?: RaptorChainInterface,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	ctValue?: number,
	chainIn?: number,
	chainOut?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class CrossChainComponentMainnet extends BaseComponent<CrossChainProps & withTranslation, CrossChainState> {
	
	private lock: boolean;
	
	constructor(props: CrossChainProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.deposit = this.deposit.bind(this);
		this.withdraw = this.withdraw.bind(this);
		this.transfer = this.transfer.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.setMaxDepositAmount = this.setMaxDepositAmount.bind(this);
		this.setMaxWithdrawalAmount = this.setMaxWithdrawalAmount.bind(this);
		this.getBalance = this.getBalance.bind(this);
		this.handleChainInUpdate = this.handleChainInUpdate.bind(this);
		this.handleChainOutUpdate = this.handleChainOutUpdate.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.switchWalletChain = this.switchWalletChain.bind(this);
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
		const state = this.readState();
		if (!!state.raptor) {
			try {
				await state.raptor.refresh();
				await state.chain.refresh();
				await state.bsc.refresh();
				await state.polygon.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: state.raptor.wallet.currentAddress,
				});

				if (resetCt) {
					// this.updateState({
					// })
				}

			}
			catch (e) {
				console.warn('Unable to update transfer status', e);
			}
		}
		else {
			return false;
		}
	}
	
	async switchWalletChain(chainid: number) {
		const state = this.readState();
		await this.updateState({pending:true});
		await state.wallet.switchNetwork(chainid);
		await this.updateState({pending:false});
	}
	
	async handleChainInUpdate(event) {
		const state = this.readState();
		
		let _chainIn = event.target.value;
		let _chainOut = (_chainIn == state.chainOut) ? state.chainIn : state.chainOut;
		
		await this.updateState({chainIn: _chainIn, chainOut: _chainOut });
	}
	
	async handleChainOutUpdate(event) {
		const state = this.readState();
		
		let _chainOut = event.target.value;
		let _chainIn = (_chainOut == state.chainIn) ? state.chainOut : state.chainIn;
		
		await this.updateState({chainOut: _chainOut, chainIn: _chainIn });
	}
	
	chainDisplay(chainName, chainID) {
		return <>
			<option value={chainID}>{chainName}</option>
		</>
	}
	
	chainList() {
		return <>
			{this.chainDisplay("BSC", 56)}
			{this.chainDisplay("RaptorChain", 0x52505452)}
			{this.chainDisplay("Polygon", 137)}
		</>
	}
	
	chainSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.chainList()}
			</select>
		</>
	}
	
	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();
			const chain = new RaptorChainInterface(wallet, "https://rpc.raptorchain.io/", true);

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const raptor = new Raptor(wallet);
			const bsc = wallet.getReadOnly(56);
			const polygon = wallet.getReadOnly(137);
			await this.updateState({ raptor: raptor, wallet: wallet, chain: chain,looping: true, pending: false, ctValue: 0, bsc: bsc, polygon: polygon, chainIn: 56, chainOut: 0x52505452 });
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
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
	
	handleAmountUpdate(event) {
		let tokens = event.target.value;
		this.updateState({ ctValue:tokens });
	}
	
	getBalance(chainid: number) {
		const state = this.readState();
		if (!state.chain) {
			return 0;
		}
		if ((chainid == 56) && (state.bsc)) {
			return state.bsc.balance;
		} else if ((chainid == 137) && state.polygon) {
			return state.polygon.balance;
		} else if ((chainid == 0x52505452)) {
			return state.chain.balance;
		} else {
			return 0;
		}
	}
	
	setMaxDepositAmount() {
		const state = this.readState();
		this.updateState({ ctValue: ((!!state.raptor) ? state.raptor.balancev3 : 0) });
	}
	
	setMaxWithdrawalAmount() {
		const state = this.readState();
		this.updateState({ ctValue: ((!!state.chain) ? state.chain.balance : 0) });
	}
	
	async deposit() {
		let state = this.readState();
		console.log(state);
		await state.chain.crossChainDeposit(state.ctValue);
		await state.raptor.refresh();
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async withdraw() {
		let state = this.readState();
		console.log(state);
		await state.chain.crossChainWithdrawal(state.ctValue);
		await state.raptor.refresh();
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async wrapToPolygon() {
		let state = this.readState();
		console.log(state);
		await this.switchWalletChain(0x52505452); // switch wallet to RaptorChain
		await state.raptor.refresh();
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async transfer() {
		let state = this.readState();
		if ((state.chainIn == 56) && (state.chainOut == 0x52505452)) {
			this.deposit();
		} else if ((state.chainIn == 0x52505452) && (state.chainOut == 56)) {
			this.withdraw();
		}
	}
	
	async setMaxAmount() {
		let state = this.readState();
		await this.updateState({ctValue: this.getBalance(state.chainIn)});
	}
	
	async addMainnetToMetamask() {
		const networkinfo = [{
			chainId: '0x52505452',
			chainName: 'RaptorChain Mainnet Beta',
			nativeCurrency:
			{
				name: 'Raptor',
				symbol: 'RPTR',
				decimals: 18
			},
			rpcUrls: ['https://rpc.raptorchain.io/web3'],
			blockExplorerUrls: ["https://explorer.raptorchain.io/"],
		}]
		await ethereum.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () { throw 'Failed adding RaptorChain Testnet to metamask' })
	}

	render() {
		this.updateOnce(false);
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		const tokenBalance = (!!state.raptor) ? state.raptor.balancev3 : 0;
		const coinBalance = (!!state.chain) ? state.chain.balance : 0;

		return <div className="staking-container">

			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
							<div className="migration-title">
							<b><font size="6"><span>Raptor</span><span style={{ color: "#31c461" }}>Chain</span></font></b>
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



                    <FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<h2>Balance breakdown</h2>
							<div>
								{this.chainSelector(state.chainIn, this.handleChainInUpdate)}&nbsp;
								<AnimatedNumber
									value={numeral(this.getBalance(state.chainIn) || 0).format('0.00')}
									duration="1000"
									formatValue={value => `Balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								>
									0 Raptor
								</AnimatedNumber>&nbsp;
								<button onClick={this.setMaxAmount} className="btn btn-md btn-primary">Max</button>
							</div>
							<div>
								{this.chainSelector(state.chainOut, this.handleChainOutUpdate)}&nbsp;
								<AnimatedNumber
									value={numeral(this.getBalance(state.chainOut) || 0).format('0.00')}
									duration="1000"
									formatValue={value => `Balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								>
									0 Raptor
								</AnimatedNumber>
							</div>
							<p>Enter the amount that you want to transfer:</p>
							<div>		
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.ctValue}></input>
                            </div>
							<br/>
                            <div className="d-flex justify-content-center button-row">
					         	<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.transfer}>Transfer</button>
								<button id="btn-addtometa" className="btn btn-complementary btn-md link-dark align-self-center stake-claim" onClick={this.addMainnetToMetamask}>Add to Metamask</button>
					        </div>
						</div>


					</FadeInLeftDiv>

                          <div className="migration-footer">
					        <font size="2"><i>Note : Funds usually take about 15 minutes to arrive, please be patient !</i></font>
				          </div>



			</div>
		</div>
	}
}

export default withTranslation()(CrossChainComponentMainnet);