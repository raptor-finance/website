import * as React from 'react';
import * as numeral from 'numeral';

import {BaseComponent, ShellErrorHandler} from "../shellInterfaces";
import {Wallet} from "../wallet";
import {RaptorLottery} from "../contracts/lottery";

import './lotteryComponent.css';

export type LotteryProps = {}
export type LotteryState = {
	lottery?: RaptorLottery,
	looping?: boolean,

	address?: string,
	balance?: number,
	tickets?: number,
	price?: number,

	lastWinner?: string,
	jackpot?: number,
	totalTickets?: number
	drawNumber?: number
}

export class LotteryComponent extends BaseComponent<LotteryProps, LotteryState> {

	handlePurchase(hash) {
		// todo show message nicer
		alert('You have successfully purchased a ticket. Your hash code is: ' + hash);
	}
	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async buyTicket(): Promise<void> {

		try {
			const lottery = this.readState().lottery;

			if (!lottery) {
				throw 'Please connect your wallet first!';
			}

			const hash = await lottery.buyTicket();
			this.handlePurchase(hash);
			this.updateOnce().then();
		}
		catch(e) {
			this.handleError(e);
		}
	}

	async componentDidMount() {

		try {
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const lottery = new RaptorLottery(wallet);

			this.updateState({lottery: lottery, looping: true});
			this.updateOnce().then();

			this.loop().then();
		}
		catch(e) {
			this.handleError(e);
		}
	}
	componentWillUnmount() {
		this.updateState({lottery: null, looping: false});
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

	render() {
		const state = this.readState();

		return <div className="lottery-container">
			<div className="container">
				<div className="row text-white lottery-header">
					<div className="col-md-12"><img src="images/lottery.svg"/>
						<p>This is a simple, non-custodial proof-of-work random number generation lottery for Raptor. You
							have the chance to win Raptor tokens by buying tickets with Raptor tokens.</p>
						<p>In order to play in our lottery, you need to connect your browser wallet (such as <a
							href="https://metamask.io/" target="_blank">Metamask</a>) and <a
							href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
							target="_blank">switch to the Binance Smart Chain</a>.</p>
					</div>
				</div>
				<div className="row lottery-body">
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-column flex-fill gradient-card primary">
							<h3>Your information</h3>
							<h5>Wallet address</h5>
							<p>{state.address || 'Please connect your wallet'}</p>
							<h5>Wallet balance</h5>
							<p>{numeral(state.balance || 0).format('0,0.00')} Raptor</p>
							<h5>Purchased tickets</h5>
							<p>{numeral(state.tickets || 0).format('0,0')} tickets</p>
							<h5>Price per ticket</h5>
							<p>{numeral(state.price || 0).format('0,0.00')} Raptor</p>
						</div>
					</div>
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-column flex-fill gradient-card light">
							<h3>Lottery status</h3>
							<h5>Current draw number</h5>
							<p>{numeral(state.drawNumber).format('0,0') || 'Nothing has been drawn yet!'}</p>
							<h5>Winner of last round</h5>
							<p>{state.lastWinner || 'Nobody won yet!'}</p>
							<h5>Current jackpot</h5>
							<p>{numeral(state.jackpot || 0).format('0,0.00')} Raptor</p>
							<h5>Total tickets for this round</h5>
							<p>{numeral(state.totalTickets || 0).format('0,0')} tickets</p>
							<button className="btn btn-primary btn-lg link-dark align-self-center" type="button" onClick={async () => this.buyTicket()} style={{marginTop:"20px"}}>Purchase a lottery ticket</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

