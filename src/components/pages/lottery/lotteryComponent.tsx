import * as React from 'react';
import * as numeral from 'numeral';

import { Wallet } from '../../wallet';
import { RaptorLottery } from '../../contracts/lottery';
import { fadeInLeft, fadeInRight, fadeInUp } from 'react-animations';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import '../paddings.css';
import './lotteryComponent.css';

export type LotteryProps = {}
export type LotteryState = WalletPageState & {
	lottery?: RaptorLottery,

	balance?: number,
	tickets?: number,
	price?: number,

	lastWinner?: string,
	jackpot?: number,
	totalTickets?: number,
	drawNumber?: number,
	countdown?: number
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

class LotteryComponent extends WalletPageBase<LotteryProps & WithTranslation, LotteryState> {

	private _countdownTimeout: any = null;

	constructor(props: LotteryProps & WithTranslation) {
		super(props);
		this.refreshCountdown = this.refreshCountdown.bind(this);
		this.state = {} as LotteryState;
	}

	handlePurchase(hash) {
		// todo show message nicer
		NotificationManager.success('You have successfully purchased a ticket. Your hash code is: ' + hash);
	}

	async buyTicket(): Promise<void> {

		try {
			this.updateState({ pending: true });
			const lottery = this.readState().lottery;

			if (!lottery) {
				throw "Please connect your wallet first!";
			}

			const hash = await lottery.buyTicket();
			this.handlePurchase(hash);
			this.updateState({ pending: false });
			this.refreshOnce().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		if (!!this._countdownTimeout) {
			clearTimeout(this._countdownTimeout);
			this._countdownTimeout = null;
		}
		this.updateState({ lottery: null });
	}

	protected resetState(): void {
		if (!!this._countdownTimeout) {
			clearTimeout(this._countdownTimeout);
			this._countdownTimeout = null;
		}
		this.updateState({ lottery: null });
	}

	private async refreshCountdown() {
		const lottery = this.readState().lottery;

		if (!lottery) {
			return false; // halts function
		}
		this.updateState({ countdown: lottery.countdown });
		this._countdownTimeout = setTimeout(this.refreshCountdown, 500);
	}

	protected get pollIntervalMs(): number {
		return 10000;
	}

	protected get connectChainId(): number {
		return 56;
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const lottery = new RaptorLottery(wallet);
		this.updateState({ lottery: lottery, looping: true });
		this.refreshCountdown();
	}

	protected async refreshOnce(): Promise<boolean> {
		const lottery = this.readState().lottery;

		if (!!lottery) {
			try {
				await lottery.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: lottery.wallet.currentAddress,
					balance: lottery.raptor.balancev3,
					jackpot: lottery.jackpot,
					price: lottery.ticketPrice,
					lastWinner: lottery.lastWinner,
					tickets: lottery.tickets,
					totalTickets: lottery.totalTickets,
					drawNumber: lottery.drawNumber,
					countdown: lottery.countdown
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

	formatCountdown(cnt: number): string {
		const days = Math.floor(cnt / 86400);
		const hours = Math.floor((cnt % 86400) / 3600);
		const minutes = Math.floor((cnt % 3600) / 60);
		const seconds = Math.floor(cnt % 60);
		return `${days} days ${hours}h ${minutes}m ${seconds}s`
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		return <div className="lottery-container">
			<div className="container">
				<div className="row text-white lottery-header">
					<div className="col-md-12">
						<div className="lottery-title">
							<span>Raptor</span>
							<span style={{ color: "#31c461" }}>Lottery</span>
							<WalletConnectButton
								connected={!!state.address}
								pending={state.pending}
								connectLabelKey="lottery.connect_wallet"
								disconnectLabelKey="lottery.disconnect_wallet"
								onConnect={this.connectWallet}
								onDisconnect={this.disconnectWallet}
							/>
						</div>
						<p>{t('lottery.paragraph1')}</p>
						<p><Trans i18nKey='lottery.paragraph2'>In order to use Raptor Lottery, you need to connect your browser wallet (such as <a
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
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en')}`}
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
								formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en')} Raptor Tokens`}
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
								formatValue={value => `${Number(parseFloat(value)).toLocaleString('en', { minimumFractionDigits: 0 })}`}
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
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en')} Raptor Tokens`}
								className="lottery-info"
							>
								{numeral(state.jackpot || 0).format('0,0.00')} Raptor Tokens
							</AnimatedNumber>
							<h2>{t('lottery.status.total_tickets')}</h2>
							<AnimatedNumber
								value={numeral(state.totalTickets || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value)).toLocaleString('en', { minimumFractionDigits: 0 })} Tickets`}
								className="lottery-info"
							>
								{numeral(state.totalTickets || 0).format('0,0')} Tickets
							</AnimatedNumber>
							<h2>{t('lottery.status.countdown_to_draw')}</h2>
							<div>Time to next draw : {this.formatCountdown(state.countdown)}</div>
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
	}
}

export default withTranslation()(LotteryComponent);
