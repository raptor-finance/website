import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from "../shellInterfaces";
import { Wallet } from "../wallet";
import { RaptorLottery } from "../contracts/lottery";

import './lotteryComponent.css';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';

export type LotteryProps = {}
export type LotteryState = {
	lottery?: RaptorLottery,
	wallet?: Wallet,
	looping?: boolean,

	address?: string,
	balance?: number,
	tickets?: number,
	price?: number,

	lastWinner?: string,
	jackpot?: number,
	totalTickets?: number,
	drawNumber?: number,
	pending?: boolean
}

class LotteryComponent extends BaseComponent<LotteryProps & WithTranslation, LotteryState> {

	constructor(props: LotteryProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
	}

	handlePurchase(hash) {
		// todo show message nicer
		alert('You have successfully purchased a ticket. Your hash code is: ' + hash);
	}
	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async buyTicket(): Promise<void> {

		try {
			this.updateState({ pending: true });
			const lottery = this.readState().lottery;

			if (!lottery) {
				throw 'Please connect your wallet first!';
			}

			const hash = await lottery.buyTicket();
			this.handlePurchase(hash);
			this.updateState({ pending: false });
			this.updateOnce().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async componentDidMount() {

		// try {
		// 	const wallet = new Wallet();
		// 	const result = await wallet.connect();

		// 	if (!result) {
		// 		throw 'The wallet connection was cancelled.';
		// 	}

		// 	const lottery = new RaptorLottery(wallet);

		// 	this.updateState({lottery: lottery, looping: true});
		// 	this.updateOnce().then();

		// 	this.loop().then();
		// }
		// catch(e) {
		// 	this.handleError(e);
		// }
	}
	componentWillUnmount() {
		this.updateState({ lottery: null, looping: false });
	}

	private async loop(): Promise<void> {
		const self = this;
		const cont = await self.updateOnce.call(self);

		if (cont) {
			setTimeout(async () => await self.loop.call(self), 10000);
		}
	}
	private async updateOnce(): Promise<boolean> {
		const lottery = this.readState().lottery;

		if (!!lottery) {
			try {
				await lottery.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: lottery.wallet.currentAddress,
					balance: lottery.raptor.balance,
					jackpot: lottery.jackpot,
					price: lottery.ticketPrice,
					lastWinner: lottery.lastWinner,
					tickets: lottery.tickets,
					totalTickets: lottery.totalTickets,
					drawNumber: lottery.drawNumber
				});
			}
			catch (e) {
				console.warn('Unable to update lottery status', e);
			}
		}
		else {
			return false;
		}

		return true;
	}

	async connectWallet() {

		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const lottery = new RaptorLottery(wallet);

			this.updateState({ lottery: lottery, wallet: wallet, looping: true, pending: false });
			this.updateOnce().then();

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

			this.updateState({ lottery: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		return <div className="lottery-container">
			<div className="container">
				<div className="row text-white lottery-header">
					<div className="col-md-12"><img src="images/lottery.svg" />
						{state.address ?
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}> 
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span> }
								{t('lottery.disconnect_wallet')} 
							</a>)
							:
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}> 
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span> }
								{t('lottery.connect_wallet')} 
							</a>)
						}
						<p>{t('lottery.paragraph1')}</p>
						<p><Trans i18nKey='lottery.paragraph2'>In order to stake Raptor tokens, you need to connect your browser wallet (such as <a
							href="https://metamask.io/">Metamask</a>) and <a
							href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
							target="_blank">Switch to the Binance Smart Chain</a></Trans>.</p>
					</div>
				</div>
				<div className="row lottery-body">
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h3>{t('lottery.your_info.title')}</h3>
							<h5>{t('lottery.your_info.wallet_address')}</h5>
							<p>{state.address || t('lottery.your_info.connect_wallet')}</p>
							<h5>{t('lottery.your_info.wallet_balance')}</h5>
							<p>{numeral(state.balance || 0).format('0,0.00')} Raptor</p>
							<h5>{t('lottery.your_info.purchased')}</h5>
							<p>{numeral(state.tickets || 0).format('0,0')} {t('lottery.your_info.tickets')}</p>
							<h5>{t('lottery.your_info.price_per_ticket')}</h5>
							<p>{numeral(state.price || 0).format('0,0.00')} Raptor</p>
						</div>
					</div>
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card light">
							<h3>{t('lottery.status.title')}</h3>
							<h5>{t('lottery.status.current_number')}</h5>
							<p>{numeral(state.drawNumber).format('0,0') || t('lottery.status.nothing')}</p>
							<h5>{t('lottery.status.winner')}</h5>
							<p>{state.lastWinner || t('lottery.status.nobody')}</p>
							<h5>{t('lottery.status.current_jackpot')}</h5>
							<p>{numeral(state.jackpot || 0).format('0,0.00')} Raptor</p>
							<h5>{t('lottery.status.total_tickets')}</h5>
							<p>{numeral(state.totalTickets || 0).format('0,0')} {t('lottery.your_info.tickets')}</p>
							<button className="btn btn-primary btn-lg link-dark align-self-center" type="button" onClick={async () => this.buyTicket()} style={{marginTop:"20px"}}>{t('lottery.status.purchase')}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation()(LotteryComponent)