import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from "../shellInterfaces";
import { Wallet } from "../wallet";

import './stakingComponent.css';
import { Raptor } from "../contracts/raptor";
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';

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

class StakingComponent extends BaseComponent<StakingProps & WithTranslation, StakingState> {

	private _timeout: any = null;

	constructor(props: StakingProps & WithTranslation) {
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
			this.updateState({ pending: true });

			if (state.ctValueStake >= 0) {
				await state.raptor.stake(state.ctValueStake);
			}
			else {
				alert("Can't stake a negative amount.");
				return;
			}

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}
	async confirmUnstake(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (state.ctValueUnstake >= 0) {
				await state.raptor.unstakeAndClaim(state.ctValueUnstake);
			}
			else {
				alert("Can't unstake a negative amount.");
				return;
			}

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}
	async confirmClaimRewards(): Promise<void> {

		try {
			const state = this.readState();
			this.updateState({ pending: true });

			await state.raptor.claim();

			this.updateState({ pending: false });
			this.updateOnce(true).then();
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
		this.updateState({ raptor: null, looping: false });
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
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const raptor = new Raptor(wallet);

			this.updateState({ raptor: raptor, wallet: wallet, looping: true, pending: false });
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

			this.updateState({ raptor: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	setStakePercentage(percent) {
		const r = this.readState().raptor;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r.balance) * (p * 0.01)), (r.balance * 0.999));

		this.updateState({
			ctPercentageStake: p,
			ctValueStake: v,
		});
	}
	setStakeValue(value) {
		const r = this.readState().raptor;
		if (!r) return;

		const t = r.balance;
		const v = Math.max(0, Math.min(+(value || 0), r.balance));
		this.updateState({
			ctPercentageStake: Math.floor(100 * v / t),
			ctValueStake: v,
		});
	}
	setUnstakePercentage(percent) {
		const r = this.readState().raptor;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r.stakedBalance) * (p * 0.01)), (r.stakedBalance * 0.999));

		this.updateState({
			ctPercentageUnstake: p,
			ctValueUnstake: v,
		});
	}
	setUnstakeValue(value) {
		const r = this.readState().raptor;
		if (!r) return;

		const t = r.stakedBalance;
		const v = Math.max(0, Math.min(+(value || 0), r.stakedBalance));
		this.updateState({
			ctPercentageStake: Math.floor(100 * v / t),
			ctValueStake: v,
		});
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">
			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
						<img src="images/staking.svg" />
						{state.address ?
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}>
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
								{t('staking.disconnect_wallet')}
							</a>)
							:
							(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}>
								{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
								{t('staking.connect_wallet')}
							</a>)
						}

						<p>{t('staking.paragraph1')}</p>
						<p><Trans i18nKey='staking.paragraph2'>In order to stake Raptor tokens, you need to connect your browser wallet (such as <a
							href="https://metamask.io/">Metamask</a>) and <a
								href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
								target="_blank">Switch to the Binance Smart Chain</a></Trans>.</p>
					</div>
				</div>
				<div className="row staking-body">
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h3>{t('staking.your_info.title')}</h3>
							<h5>{t('staking.your_info.wallet_address')}</h5>
							<p>{state.address || t('staking.your_info.connect_wallet')}</p>
							<h5>{t('staking.your_info.tradeable')}</h5>
							<p>{numeral(state.balance || 0).format('0,0.00')} Raptor</p>
							<h5>{t('staking.your_info.staked')}</h5>
							<p>{numeral(state.stakedBalance || 0).format('0,0.00')} Raptor</p>
							<h5>{t('staking.your_info.pending_rewards')}</h5>
							<p>{numeral(state.pendingRewards || 0).format('0,0.00')} Raptor</p>
						</div>
					</div>
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card dark">
						<div style={{ margin: "-20px" }}>
							<ul role="tablist" className="nav nav-tabs" style={{ padding: "10px", paddingBottom: "0" }}>
								<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link active" href="#ctl-stake">{t('staking.stake.title')}</a></li>
								<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link" href="#ctl-unstake">{t('staking.unstake.title')}</a></li>
									</ul>
									<div className="tab-content">
										<div role="tabpanel" className="tab-pane active" id="ctl-stake">
											<form id="staking-form">
												<label className="form-label">{t('staking.stake.percentage')}</label>
												<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
													<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageStake || 0} onChange={this.handleStakeSlider} style={{ border: "none", background: "none" }} />
													<label className="form-label align-self-center">{numeral(state.ctPercentageStake || 0).format('0')}%</label>
												</div>
												<div className="d-flex flex-row justify-content-evenly staking-percentages">
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(0)}>0%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(25)}>25%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(50)}>50%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(75)}>75%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(100)}>100%</button>
												</div>
											<label className="form-label">{t('staking.stake.amount')}</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputStake} value={state.ctValueStake || 0} />
											<div className="button-row">
												<button className="btn btn-primary btn-lg link-dark align-self-center stake-confirm" disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake()}>{t('staking.stake.title')}</button>
												<button className="btn btn-complementary btn-lg link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
												</div>
										</form>
										</div>
										<div role="tabpanel" className="tab-pane" id="ctl-unstake">
											<form id="unstaking-form">
												<label className="form-label">{t('staking.unstake.percentage')}</label>
												<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
													<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageUnstake || 0} onChange={this.handleUnstakeSlider} style={{ border: "none", background: "none" }} />
													<label className="form-label align-self-center">{numeral(state.ctPercentageUnstake || 0).format('0')}%</label>
												</div>
												<div className="d-flex flex-row justify-content-evenly staking-percentages">
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(0)}>0%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(25)}>25%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(50)}>50%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(75)}>75%</button>
													<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(100)}>100%</button>
												</div>
											<label className="form-label">{t('staking.unstake.amount')}</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputUnstake} value={state.ctValueUnstake || 0} />
											<div className="button-row">
												<button className="btn btn-primary btn-lg link-dark align-self-center stake-confirm" disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>{t('staking.unstake.title')}</button>
												<button className="btn btn-complementary btn-lg link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
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

export default withTranslation()(StakingComponent)