import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
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
	chain?: RaptorChainInterface,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	ctValue?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class CrossChainComponent extends BaseComponent<CrossChainProps & withTranslation, CrossChainState> {
	
	private lock: boolean;
	
	constructor(props: CrossChainProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.deposit = this.deposit.bind(this);
		this.withdraw = this.withdraw.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.setMaxDepositAmount = this.setMaxDepositAmount.bind(this);
		this.setMaxWithdrawalAmount = this.setMaxWithdrawalAmount.bind(this);
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
		const raptor = this.readState().raptor;
		const chain = this.readState().chain;
		if (!!raptor) {
			try {
				await raptor.refresh();
				await chain.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: raptor.wallet.currentAddress,
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
	
	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect(97);
			const chain = new RaptorChainInterface(wallet, "https://rptr-testnet-1.dynamic-dns.net/")

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const raptor = new Raptor(wallet);

			this.updateState({ raptor: raptor, wallet: wallet, chain: chain,looping: true, pending: false, ctValue: 0 });
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
							<div onClick={this.setMaxDepositAmount}>
								<AnimatedNumber
									value={numeral(tokenBalance || 0).format('0.00')}
									duration="1000"
									formatValue={value => `BSC-side : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
									// className="staking-info"
									onclick={this.setMaxDepositAmount}
								>
									0 Raptor
								</AnimatedNumber>
							</div>
							<div onClick={this.setMaxWithdrawalAmount}>
								<AnimatedNumber
									value={numeral(coinBalance || 0).format('0.00')}
									duration="1000"
									formatValue={value => `RaptorChain-side : ${Number(parseFloat(value)).toLocaleString('en')}`}
									// className="staking-info"
									onclick={this.setMaxWithdrawalAmount}
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
					         	<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.deposit}>Deposit</button>
					         	<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.withdraw}>Withdraw</button>
								<button id="btn-addtometa" className="btn btn-complementary btn-md link-dark align-self-center stake-claim" onClick={this.addTestnetToMetamask}>Add Testnet to metamask</button>
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

export default withTranslation()(CrossChainComponent);