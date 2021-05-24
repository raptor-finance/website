import * as React from 'react';
import * as numeral from 'numeral';

import {BaseComponent} from "../shellInterfaces";
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
}

export class LotteryComponent extends BaseComponent<LotteryProps, LotteryState> {

	handlePurchase(hash) {
		// todo show message nicer
		alert('You have successfully purchased a ticket. Your hash code is:<br/>' + hash);
	}
	handleError(error) {
		// todo show error nicer
		alert('Error: ' + error);
		console.error(error);
	}

	async buyTicket(): Promise<void> {

		try {
			const lottery = this.readState().lottery;

			if (!lottery) {
				throw 'Please connect your wallet first!';
			}

			const hash = await lottery.buyTicket();
			this.handlePurchase(hash);
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
					totalTickets: lottery.totalTickets
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
			<div className="row">
				<div className="col-12 col-lg-10">
					<img src="https://raptr.finance/images/lottery.svg" className="mb-3" width="250" />
					<div>
						<p className="text-white">
							This is a simple, non-custodial Proof of Work Random Number Generation <br />
							Lottery for Raptor to easily purchase Raptor Lottery Tickets!
						</p>
						<p className="text-white">
							You need to be connected to the Binance Smart Chain to play in our lotteries!
						</p>
					</div>
					<div>
						<div className="row">
							<div className="col-12 col-md-6 col-lg-6">
								<div className="card card-rounded-x2  overflow-hidden mt-3 gradient-green-blue">
									<div className="card-body p-5 text-left">
										<div>
											<h4 className="text-dark font-weight-bold">Your Information</h4>
										</div>
										<div className="mt-3">
											<strong className="text-dark">Address</strong>
											<div className="text-dark-light small">{state.address || 'Please connect your wallet'}</div>
										</div>
										<div className="mt-3">
											<strong className="text-dark">Balance</strong>
											<div className="text-dark-light">{numeral(state.balance || 0).format('0,0.00')}</div>
										</div>
										<div className="mt-3">
											<strong className="text-dark">Tickets balance</strong>
											<div className="text-dark-light">{numeral(state.tickets || 0).format('0,0.00')}</div>
										</div>
										<div className="mt-3">
											<strong className="text-dark">Ticket price:</strong>
											<div className="text-dark font-weight-bold">{numeral(state.price || 0).format('0,0.00')}</div>
										</div>
										<div className="mt-3">
											<div>
												<a onClick={async () => this.buyTicket()} className="btn btn-dark btn-block">Purchase a ticket</a>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-12 col-md-6 col-lg-6">
								<div className="card card-rounded-x2  overflow-hidden mt-3 gradient-green-red">
									<div className="card-body p-5 text-left">
										<div>
											<h4 className="text-dark font-weight-bold">Current Jackpot</h4>
										</div>
										<div className="mt-5">
											<strong className="text-dark">Winner of last round</strong>
											<div className="text-dark-light">{state.lastWinner || 'Nobody won yet'}</div>
										</div>
										<div className="mt-3">
											<strong className="text-dark">Current jackpot</strong>
											<div className="text-dark-light">{numeral(state.jackpot || 0).format('0,0.00')}</div>
										</div>
										<div className="mt-3 mb-4">
											<strong className="text-dark">Total tickets for this round</strong>
											<div className="text-dark-light">{numeral(state.totalTickets || 0).format('0,0.00')}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

