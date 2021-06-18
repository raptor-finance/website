import * as React from 'react';
import * as numeral from 'numeral';

import {BaseComponent, ShellErrorHandler} from "../shellInterfaces";
import {Wallet} from "../wallet";

import './stakingComponent.css';
import {Raptor} from "../contracts/raptor";

export type StakingProps = {}
export type StakingState = {
	raptor?: Raptor,
	wallet?: Wallet,
	looping?: boolean,

	// actual set values
	address?: string,
	balance?: number,
	stakedBalance?: number,
	pendingRewards?: number,

	// values pending to be set
	ctPercentageStake?: number,
	ctValueStake?: number,
	ctPercentageUnstake?: number,
	ctValueUnstake?: number,
	pending?: boolean
}

export class StakingComponent extends BaseComponent<StakingProps, StakingState> {

	private _timeout: any = null;

	constructor(props) {
		super(props);

		this.handleStakeSlider = this.handleStakeSlider.bind(this);
		this.handleUnstakeSlider = this.handleUnstakeSlider.bind(this);
		this.handleInputStake = this.handleInputStake.bind(this);
		this.handleInputUnstake = this.handleInputUnstake.bind(this);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.state = {};
	}

	handleStakeSlider(event) {
		this.setStakePercentage(event.target.value);
	}
	handleUnstakeSlider(event) {
		this.setUnstakePercentage(event.target.value);
	}
	handleInputStake(event) {
		this.setStakeValue(event.target.value);
	}
	handleInputUnstake(event) {
		this.setUnstakeValue(event.target.value);
	}

	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async confirmStake(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({pending: true});

			if (state.ctValueStake >= 0) {
				await state.raptor.stake(state.ctValueStake);
			}
			else {
				alert("Can't stake a negative amount.");
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
	async confirmUnstake(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({pending: true});

			if (state.ctValueUnstake >= 0) {
				await state.raptor.unstakeAndClaim(state.ctValueUnstake);
			}
			else {
				alert("Can't unstake a negative amount.");
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
		// try {
		// 	const wallet = new Wallet();
		// 	const result = await wallet.connect();

		// 	if (!result) {
		// 		throw 'The wallet connection was cancelled.';
		// 	}

		// 	const raptor = new Raptor(wallet);

		// 	this.updateState({raptor: raptor, looping: true});
		// 	this.updateOnce(true).then();

		// 	this.loop().then();
		// }
		// catch(e) {
		// 	this.handleError(e);
		// }
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
						ctPercentageStake: 0,
						ctValueStake: 0,
						ctPercentageUnstake: 0,
						ctValueUnstake: 0
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

	async connectWallet() {
		
		try {
			this.updateState({pending: true});
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}
			
			const raptor = new Raptor(wallet);

			this.updateState({raptor: raptor, wallet: wallet, looping: true, pending: false});
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch(e) {
			this.updateState({pending: false});
			this.handleError(e);
		}
	}

	async disconnectWallet() {
		
		try {
			this.updateState({pending: true});		
			const result = await this.state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}
			
			this.updateState({raptor: null, wallet: null, address: null, looping: false, pending: false});
		}
		catch(e) {
			this.updateState({pending: false});
			this.handleError(e);
		}
	}

	setStakePercentage(percent) {
		const r = this.readState().raptor;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent||0), 100));
		const v = Math.min(((r.balance) * (p * 0.01)), (r.balance*0.999));

		this.updateState({
			ctPercentageStake: p,
			ctValueStake: v,
		});
	}
	setStakeValue(value) {
		const r = this.readState().raptor;
		if (!r) return;

		const t = r.balance;
		const v = Math.max(0, Math.min(+(value||0),r.balance));
		this.updateState({
			ctPercentageStake: Math.floor(100 * v / t),
			ctValueStake: v,
		});
	}
	setUnstakePercentage(percent) {
		const r = this.readState().raptor;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent||0), 100));
		const v =  Math.min(((r.stakedBalance) * (p * 0.01)), (r.stakedBalance * 0.999));

		this.updateState({
			ctPercentageUnstake: p,
			ctValueUnstake: v,
		});
	}
	setUnstakeValue(value) {
		const r = this.readState().raptor;
		if (!r) return;

		const t = r.stakedBalance;
		const v = Math.max(0, Math.min(+(value||0),r.stakedBalance));
		this.updateState({
			ctPercentageStake: Math.floor(100 * v / t),
			ctValueStake: v,
		});
	}

	render() {
		const state = this.readState();

		return <div className="staking-container">
			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
						<img src="images/staking.svg"/>
						{state.address ?
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}> 
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span> }
								Disconnect Wallet 
							</a>)
							:
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}> 
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span> }
								 Connect Wallet 
							</a>)
						}
						
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
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
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
						<div className="shadow d-flex flex-column flex-fill gradient-card dark">
							<div style={{margin: "-20px"}}>
								<ul role="tablist" className="nav nav-tabs" style={{padding: "10px", paddingBottom: "0"}}>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link active" href="#ctl-stake">Stake</a></li>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link" href="#ctl-unstake">Unstake</a></li>
								</ul>
								<div className="tab-content">
									<div role="tabpanel" className="tab-pane active" id="ctl-stake">
										<form id="staking-form">
											<label className="form-label">Percentage of tokens to stake:</label>
											<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
												<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageStake||0} onChange={this.handleStakeSlider} style={{border: "none", background: "none"}}/>
												<label className="form-label align-self-center">{numeral(state.ctPercentageStake||0).format('0')}%</label>
											</div>
											<div className="d-flex flex-row justify-content-evenly staking-percentages">
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(0)}>0%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(25)}>25%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(50)}>50%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(75)}>75%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(100)}>100%</button>
											</div>
											<label className="form-label">Amount of tokens to stake:</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputStake} value={state.ctValueStake||0}/>
											<div className="button-row">
												<button className="btn btn-primary btn-lg link-dark align-self-center stake-confirm" disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake()}>Stake</button>
												<button className="btn btn-light btn-lg link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>Claim rewards</button>
											</div>
										</form>
									</div>
									<div role="tabpanel" className="tab-pane" id="ctl-unstake">
										<form id="unstaking-form">
											<label className="form-label">Percentage of tokens to unstake:</label>
											<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
												<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageUnstake||0} onChange={this.handleUnstakeSlider} style={{border: "none", background: "none"}}/>
												<label className="form-label align-self-center">{numeral(state.ctPercentageUnstake||0).format('0')}%</label>
											</div>
											<div className="d-flex flex-row justify-content-evenly staking-percentages">
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(0)}>0%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(25)}>25%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(50)}>50%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(75)}>75%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(100)}>100%</button>
											</div>
											<label className="form-label">Amount of tokens to unstake:</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputUnstake} value={state.ctValueUnstake||0}/>
											<div className="button-row">
												<button className="btn btn-primary btn-lg link-dark align-self-center stake-confirm" disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>Unstake</button>
												<button className="btn btn-light btn-lg link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>Claim rewards</button>
											</div>
										</form>
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
