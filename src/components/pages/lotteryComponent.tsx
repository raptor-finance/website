import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { RaptorLottery } from '../contracts/lottery';
import { fadeInLeft, fadeInRight, fadeInUp } from 'react-animations';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';

import './lotteryComponent.css';

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

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;
const FadeInRightAnimation = keyframes`${fadeInRight}`;
const FadeInRightDiv = styled.div`
  animation: ease-out 0.8s ${FadeInRightAnimation};
`;
const FadeInUpAnimation = keyframes`${fadeInUp}`;
const FadeInUpDiv = styled.div`
  animation: ease-out 0.6s ${FadeInUpAnimation};
`;

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
			// this.updateState({ pending: true });
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
			// this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async disconnectWallet() {

		try {
			// this.updateState({ pending: true });
			const result = await this.state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}

			this.updateState({ lottery: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			// this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		return <div>
			{
				state.pending &&
				<div className="overlay"> 
					<div className="spinner-border text-success" role="status">
						<span className="sr-only">Loading...</span>
					</div>
				</div>
			}
			<div className="lottery-container">
				<div className="container">
					<div className="row text-white lottery-header">
						<div className="col-md-12"><img src="images/lottery.svg" />
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}>
									{/* {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('lottery.disconnect_wallet')} */}
									{state.address}
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}>
									{/* {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>} */}
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
						<FadeInLeftDiv className="col-md-6 d-flex">
							<div className="shadow d-flex flex-column flex-fill gradient-card primary">
								<h1>{t('lottery.your_info.title')}</h1>
								<h2>{t('lottery.your_info.wallet_address')}</h2>
								<p className="lottery-info">{state.address || t('lottery.your_info.connect_wallet')}</p>
								<h2>{t('lottery.your_info.wallet_balance')}</h2>
								<AnimatedNumber
									value={numeral(state.balance || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
									className="lottery-info"
								>
									0 Raptor
								</AnimatedNumber>
								<h2>{t('lottery.your_info.purchased')}</h2>
								<AnimatedNumber
									value={numeral(state.tickets || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })} Tickets`}
									className="lottery-info"
								>
									0 tickets
									</AnimatedNumber>
								<h2>{t('lottery.your_info.price_per_ticket')}</h2>
								<AnimatedNumber
									value={numeral(state.price || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} Raptor Tokens`}
									className="lottery-info"
								>
									{numeral(state.price || 0).format('0,0.00')} Raptor Tokens
								</AnimatedNumber>
							</div>
						</FadeInLeftDiv>
						<FadeInRightDiv className="col-md-6 d-flex">
							<div className="shadow d-flex flex-column flex-fill gradient-card light">
								<h1>{t('lottery.status.title')}</h1>
								<h2>{t('lottery.status.current_number')}</h2>
								<AnimatedNumber
									value={numeral(state.drawNumber || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })}`}
									className="lottery-info"
								>
									{numeral(state.drawNumber).format('0,0') || t('lottery.status.nothing')}
								</AnimatedNumber>
								<h2>{t('lottery.status.winner')}</h2>
								<p className="lottery-info">{state.lastWinner || t('lottery.status.nobody')}</p>
								<h2>{t('lottery.status.current_jackpot')}</h2>
								<AnimatedNumber
									value={numeral(state.jackpot || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} Raptor Tokens`}
									className="lottery-info"
								>
									{numeral(state.jackpot || 0).format('0,0.00')} Raptor Tokens
								</AnimatedNumber>
								<h2>{t('lottery.status.total_tickets')}</h2>
								<AnimatedNumber
									value={numeral(state.totalTickets || 0).format('0.00')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })} Tickets`}
									className="lottery-info"
								>
									{numeral(state.totalTickets || 0).format('0,0')} Tickets
								</AnimatedNumber>
							</div>
						</FadeInRightDiv>
						<FadeInUpDiv>
							<div className="d-flex justify-content-center">
								<button className="btn btn-complementary btn-lg link-dark align-self-center btn-lottery" type="button" onClick={async () => this.buyTicket()}>{
									t('lottery.status.purchase')}
								</button>
							</div>
						</FadeInUpDiv>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation()(LotteryComponent);
