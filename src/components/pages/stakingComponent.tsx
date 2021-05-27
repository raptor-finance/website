import * as React from 'react';
import * as numeral from 'numeral';

import {BaseComponent} from "../shellInterfaces";
import {Wallet} from "../wallet";

import './stakingComponent.css';
import {Raptor} from "../contracts/raptor";

export type StakingProps = {}
export type StakingState = {
	raptor?: Raptor,
	looping?: boolean,

	// actual set values
	address?: string,
	balance?: number,
	stakedBalance?: number,
	pendingRewards?: number,

	// values pending to be set
	ctPercentage?: number,
	ctValue?: number,
	ctLabel?: string,
	pending?: boolean
}

export class StakingComponent extends BaseComponent<StakingProps, StakingState> {

	private _timeout: any = null;

	constructor(props) {
		super(props);

		this.handleSlider = this.handleSlider.bind(this);
		this.handleInput = this.handleInput.bind(this);

		this.state = {};
	}

	handleSlider(event) {
		this.setStakePercentage(event.target.value);
	}
	handleInput(event) {
		this.setStakeValue(event.target.value);
	}

	handleError(error) {
		// todo show error nicer

		const message = !!error && !!error.message ? error.message : error;

		alert('Error: ' + message);
		console.error(error);
	}

	async confirmStake(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({pending: true});

			if (state.ctValue > state.raptor.stakedBalance) {
				// stake
				const delta = state.ctValue - state.raptor.stakedBalance;
				await state.raptor.stake(delta);
			}
			else if (state.ctValue < state.raptor.stakedBalance) {
				// unstake
				const delta = state.raptor.stakedBalance - state.ctValue;
				await state.raptor.unstakeAndClaim(delta);
			}
			else {
				alert("Your stake doesn't need to be updated.");
				return;
			}

			this.updateState({pending: false});
			this.updateOnce(true).then();
		}
		catch(e) {
			this.updateState({pending: false});
			this.handleError(e);
		}
	}
	async confirmClaimRewards(): Promise<void> {

		try {
			const state = this.readState();
			this.updateState({pending: true});

			await state.raptor.claim();

			this.updateState({pending: false});
			this.updateOnce(true).then();
		}
		catch(e) {
			this.updateState({pending: false});
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

			const raptor = new Raptor(wallet);

			this.updateState({raptor: raptor, looping: true});
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch(e) {
			this.handleError(e);
		}
	}
	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
		}
		this.updateState({raptor: null, looping: false});
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

		if (!!raptor) {
			try {
				await raptor.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: raptor.wallet.currentAddress,
					balance: raptor.balance,
					stakedBalance: raptor.stakedBalance,
					pendingRewards: raptor.pendingStakeRewards
				});

				if (resetCt) {
					this.updateState({
						ctPercentage: (Math.floor(100 * raptor.stakedBalance / (raptor.balance + raptor.stakedBalance))),
						ctValue: raptor.stakedBalance,
						ctLabel: 'Please set amount'
					})
				}

			}
			catch (e) {
				console.warn('Unable to update staking status', e);
			}
		}
		else {
			return false;
		}

		return true;
	}

	setStakePercentage(percent) {
		const r = this.readState().raptor;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent||0), 100));
		const v = (r.stakedBalance + r.balance) * (p * 0.01);

		this.updateState({
			ctPercentage: p,
			ctValue: v,
			ctLabel: v < r.stakedBalance ? "Unstake tokens" : v > r.stakedBalance ? "Stake tokens" : "Please set amount"
		});
	}
	setStakeValue(value) {
		const r = this.readState().raptor;
		if (!r) return;

		const t = r.stakedBalance + r.balance;
		const v = Math.max(0, Math.min(+(value||0),r.stakedBalance + r.balance));
		this.updateState({
			ctPercentage: Math.floor(100 * v / t),
			ctValue: v,
			ctLabel: v < r.stakedBalance ? "Unstake tokens" : v > r.stakedBalance ? "Stake more tokens" : "Please set amount"
		});
	}

	render() {
		const state = this.readState();

		return <div className="staking-container">
			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12"><img src="images/staking.svg"/>
						<p>Using Raptor staking, you can easily earn more Raptor tokens over time while the blockchain is
							running. Planning to hold Raptor tokens to help our planet? Earn more while doing so and collect
							your passive income.</p>
						<p>In order to stake Raptor tokens, you need to connect your browser wallet (such as <a
							href="https://metamask.io/">Metamask</a>) and <a
							href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
							target="_blank">Switch to the Binance Smart Chain</a>.</p>
					</div>
				</div>
				<div className="row staking-body">
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-column flex-fill gradient-card primary">
							<h3>Your information</h3>
							<h5>Wallet address</h5>
							<p>{state.address || 'Please connect your wallet'}</p>
							<h5>Tradeable balance</h5>
							<p>{numeral(state.balance || 0).format('0,0.00')} Raptor</p>
							<h5>Staked balance</h5>
							<p>{numeral(state.stakedBalance || 0).format('0,0.00')} Raptor</p>
							<h5>Pending rewards</h5>
							<p>{numeral(state.pendingRewards || 0).format('0,0.00')} Raptor</p>
						</div>
					</div>
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-column flex-fill gradient-card dark">
							<h3>Staking control</h3>
							<form id="staking-form">
								<label className="form-label">Percentage of tokens to stake:</label>
								<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
									<input type="range" className="form-range form-control" id="staking-slider" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentage||0} onChange={this.handleSlider} style={{border: "none", background: "none"}}/>
									<label className="form-label align-self-center">{numeral(state.ctPercentage||0).format('0')}%</label>
								</div>
								<div className="d-flex flex-row justify-content-evenly staking-percentages">
									<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" id="stake-0" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(0)}>0%</button>
									<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" id="stake-25" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(25)}>25%</button>
									<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" id="stake-50" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(50)}>50%</button>
									<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" id="stake-75" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(75)}>75%</button>
									<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" id="stake-100" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(100)}>100%</button>
								</div>
								<label className="form-label">Amount of tokens to stake:</label>
								<input type="number" className="form-control form-control-lg" id="staking-value" disabled={state.pending} onChange={this.handleInput} value={state.ctValue||0}/>
								<div className="button-row">
									<button className="btn btn-primary btn-lg link-dark align-self-center stake-confirm" disabled={state.stakedBalance === state.ctValue || state.pending} type="button" onClick={async () => this.confirmStake()}>{state.ctLabel}</button>
									<button className="btn btn-light btn-lg link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>Claim rewards</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

