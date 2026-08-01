import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { RaptorChainInterface } from '../../contracts/chain';
import { CHAIN, CHAIN_HEX, CHAIN_META } from '../../../config';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import './migrationComponent.css';
import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type CrossChainProps = {};
export type CrossChainState = WalletPageState & {
	raptor?: Raptor,
	chain?: RaptorChainInterface,
	ctValue?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class CrossChainComponent extends WalletPageBase<CrossChainProps & WithTranslation, CrossChainState> {

	constructor(props: CrossChainProps & WithTranslation) {
		super(props);
		this.deposit = this.deposit.bind(this);
		this.withdraw = this.withdraw.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.setMaxDepositAmount = this.setMaxDepositAmount.bind(this);
		this.setMaxWithdrawalAmount = this.setMaxWithdrawalAmount.bind(this);
		this.state = {} as CrossChainState;
	}

	protected get connectChainId(): number {
		return 97; // BSC testnet
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const chain = new RaptorChainInterface(wallet, "https://rptr-testnet-1.dynamic-dns.net/");
		const raptor = new Raptor(wallet);
		this.updateState({ raptor: raptor, chain: chain, looping: true, ctValue: 0 });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
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
			}
			catch (e) {
				console.warn('Unable to update transfer status', e);
			}
		}
		else {
			return false;
		}
		return true;
	}

	protected resetState(): void {
		this.updateState({ raptor: null, chain: null });
	}

	handleAmountUpdate(event) {
		let tokens = event.target.value;
		this.updateState({ ctValue: tokens });
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
		await state.chain.crossChainDeposit(state.ctValue);
		await state.raptor.refresh();
		await state.chain.refresh();
		this.refreshOnce(true);
	}

	async withdraw() {
		let state = this.readState();
		await state.chain.crossChainWithdrawal(state.ctValue);
		await state.raptor.refresh();
		await state.chain.refresh();
		this.refreshOnce(true);
	}

	async addTestnetToMetamask() {
		// Delegate to Wallet so the request is routed through the connected
		// provider (providerRequest) instead of the global window.ethereum,
		// which may belong to a different wallet extension.
		const wallet = this.readState().wallet || new Wallet();
		await wallet.addTestnetToMetamask();
	}

	render() {
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
							<WalletConnectButton
								connected={!!state.address}
								pending={state.pending}
								onConnect={this.connectWallet}
								onDisconnect={this.disconnectWallet}
							/>
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
						<br />
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