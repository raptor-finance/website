import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { Wallet } from '../../wallet';
import { RaptorFarm } from '../../contracts/raptorfarm';
import { RaptorFarmNew } from '../../contracts/raptorfarmnew';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { Tooltip, OverlayTrigger, Container, Row, Col } from 'react-bootstrap';
import AnimatedNumber from 'animated-number-react';

import './stakingComponent.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import { farmsList } from '../../listStaking';

export type FarmProps = {};
export type FarmState = {
  farm?,
  wallet?: Wallet,
  looping?: boolean,
  apr?,
  address?: string,
  balance?: number,
  lpBalance?: number,
  stakedLp?: number,
  amount?: number,
  rewards?: number,
  ctValue?,
  pending?: boolean,
  tvl?: number
}

<<<<<<< Updated upstream
//tabs
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export type StakingProps = {};
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
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;
const FadeInRightAnimation = keyframes`${fadeInRight}`;
const FadeInRightDiv = styled.div`
  animation: ease-out 0.8s ${FadeInRightAnimation};
`;
const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 5s ${PulseAnimation};
`;

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
				NotificationManager.warning("Can't stake a negative amount.");
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
				NotificationManager.warning("Can't unstake a negative amount.");
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
		if ((window.ethereum || {}).selectedAddress) {
			this.connectWallet();
		}
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
		const v = ((r.balance) * (p * 0.01));

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
		const v = ((r.stakedBalance) * (p * 0.01));

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
			ctPercentageUnstake: Math.floor(100 * v / t),
			ctValueUnstake: v,
		});
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">

        <Tabs>
           <TabList>
             <Tab className="shadow btn btn-primary ladda-button btn-md btn-wallet">Staking V3</Tab>
	         <Tab className="shadow btn btn-primary ladda-button btn-md btn-wallet">Staking V2 (Deprecated)</Tab>
           </TabList>

	       <TabPanel>
               <div className="container">
				 <div className="row text-white staking-header">
					<div className="col-md-12">
						<div className="staking-title">
							<span>Raptor</span>
							<span style={{ color: "#31c461" }}>Staking </span>
							<span>V3</span>
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.disconnectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.disconnect_wallet')}
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.connectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.connect_wallet')}
								</a>)
							}
						</div>

						<p>{t('staking.paragraph1')}</p>
						<p><Trans i18nKey='staking.paragraph2'>In order to stake Raptor tokens, you need to connect your browser wallet (such as <a
							href="https://metamask.io/">Metamask</a>) and <a
								href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
								target="_blank">Switch to the Binance Smart Chain</a></Trans>.
						</p>

					</div>
			       </div>
				<div className="row staking-body">
					<FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h1>{t('staking.your_info.title')}</h1>
							<h2>{t('staking.your_info.wallet_address')}</h2>
							<p>{state.address || t('staking.your_info.connect_wallet')}</p>
							<h2>{t('staking.your_info.tradeable')}</h2>
							<AnimatedNumber
								value={numeral(state.balance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
							<h2>{t('staking.your_info.staked')}</h2>
							<AnimatedNumber
								value={numeral(state.stakedBalance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
							<h2>{t('staking.your_info.pending_rewards')}</h2>
							<AnimatedNumber
								value={numeral(state.pendingRewards || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
						</div>
					</FadeInLeftDiv>
					<FadeInRightDiv className="col-md-6 d-flex">
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
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake()}>{t('staking.stake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
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
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>{t('staking.unstake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</FadeInRightDiv>
				</div>
		       </div>
           </TabPanel>
           <TabPanel>
               <div className="container">
				  <div className="row text-white staking-header">
				  	<div className="col-md-12">
						<div className="staking-title">
							<span>Raptor</span>
							<span style={{ color: "#31c461" }}>Staking </span>
							<span>V2 (Deprecated)</span>
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.disconnectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.disconnect_wallet')}
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.connectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.connect_wallet')}
								</a>)
							}
						</div>

						<p>{t('staking.paragraph1old')}</p>

						<p>
							<font size="6" color="red"><i>Please unstake and <u><NavLink to="/migrate" activeClassName="active">Migrate</NavLink></u> to Raptor V3</i></font>
						</p>
					</div>
				</div>
				<div className="row staking-body">
					<FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h1>{t('staking.your_info.title')}</h1>
							<h2>{t('staking.your_info.wallet_address')}</h2>
							<p>{state.address || t('staking.your_info.connect_wallet')}</p>
							<h2>{t('staking.your_info.tradeable')}</h2>
							<AnimatedNumber
								value={numeral(state.balance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
							<h2>{t('staking.your_info.staked')}</h2>
							<AnimatedNumber
								value={numeral(state.stakedBalance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
							<h2>{t('staking.your_info.pending_rewards')}</h2>
							<AnimatedNumber
								value={numeral(state.pendingRewards || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
						</div>
					</FadeInLeftDiv>
					<FadeInRightDiv className="col-md-6 d-flex">
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
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake()}>{t('staking.stake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
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
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>{t('staking.unstake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</FadeInRightDiv>
				</div>
		       </div>
           </TabPanel>
        </Tabs>
	  <NotificationContainer />
	</div>
	}
=======
class StakingComponent extends BaseComponent<FarmProps & WithTranslation, FarmState> {

 constructor(props: FarmProps & WithTranslation) {
    super(props);

    this.connectWallet = this.connectWallet.bind(this);
    this.disconnectWallet = this.disconnectWallet.bind(this);
    this.FarmCard = this.FarmCard.bind(this);
    this.stakingValueChanged = this.stakingValueChanged.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this);

    this.state = {};
  }

  handleError(error) {
    ShellErrorHandler.handle(error);
  }

  async connectWallet() {
    try {
      this.updateState({ pending: true });
	  var tvl = 0;
      const wallet = new Wallet();
      const result = await wallet.connect();

      if (!result) {
        throw 'The wallet connection was cancelled.';
      }

      var farm = {};
      farm[`0,0`] = new RaptorFarm(wallet, 0);
      farm[`1,0`] = new RaptorFarmNew(wallet, 0);
      // await farm[0].finishSetup();

      const poolLengthOld = (await farm[`0,0`].contract.methods.poolLength().call());
      var i = 1;
      while (i < poolLengthOld) {
        farm[`0,${i}`] = new RaptorFarm(wallet, i);
        i += 1;
      }
	  
      const poolLengthNew = (await farm[`1,0`].contract.methods.poolLength().call());
      var i = 1;
      while (i < poolLengthNew) {
        farm[`1,${i}`] = new RaptorFarm(wallet, i);
        i += 1;
      }

      this.updateState({ farm: farm, wallet: wallet, looping: true, tvl:tvl });
      await this.updateOnce(false);
      this.updateState({ pending: false });
      this.loop().then();
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  getLpBalance(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.lpBalance || 0);
    }
  }

  getStakedBalance(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.stakedLp || 0);
    }
  }

  getRewards(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.rewards || 0);
    }
  }

  getApr(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.apr || 0);
    }
  }
  
  getTVL(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.tvl || 0);
    }
  }
  
  getUsdAvbl(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.usdavailable || 0);
    }
  }
  
  getUsdStaked(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.usdstaked || 0);
    }
  }
  
  getUsdRewards(pid: string): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.usdrewards || 0);
    }
  }

  getAmounts(version: number, pid: number) {
    var amounts = {};
    amounts["apr"] = this.getApr(`${version},${pid}`);
    amounts["lpBalance"] = this.getLpBalance(`${version},${pid}`);
    amounts["stakedLp"] = this.getStakedBalance(`${version},${pid}`);
    amounts["rewards"] = this.getRewards(`${version},${pid}`);
    amounts["tvl"] = this.getTVL(`${version},${pid}`);
    amounts["usdavailable"] = this.getUsdAvbl(`${version},${pid}`);
    amounts["usdstaked"] = this.getUsdStaked(`${version},${pid}`);
    amounts["usdrewards"] = this.getUsdRewards(`${version},${pid}`);
    return amounts;
  }

  async disconnectWallet() {
    try {
      this.updateState({ pending: true });
      const result = await this.state.wallet.disconnect();
      if (result) {
        throw 'The wallet connection was cancelled.';
      }

      this.updateState({ farm: null, wallet: null, address: null, looping: false, pending: false });
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
    this.updateState({ farm: null, looping: false });
  }

  private async loop(): Promise<void> {
    const self = this;
    const cont = await self.updateOnce.call(self);

    if (cont) {
      setTimeout(async () => await self.loop.call(self), 10000);
    }
  }

  private async updateOnce(resetCt?: boolean): Promise<boolean> {
    const farm = this.readState().farm;
	const poolLengthOld = (await farm["0,0"].contract.methods.poolLength().call());
	const poolLengthNew = (await farm["1,0"].contract.methods.poolLength().call());
    if (!!farm) {
      try {
        let i = 0;
		let j = 0;
        while (i < poolLengthOld) {
          farm[`0,${i}`].refresh();
          i += 1;
        }
        while (j < poolLengthNew-1) {
          farm[`1,${j}`].refresh();
          j += 1;
        }
		await farm[`1,${poolLengthNew-1}`].refresh();
        if (!this.readState().looping) {
          return false;
        }
        this.updateState({
          address: farm["0,0"].wallet.currentAddress,
        });

        if (resetCt) {
          this.updateState({
            address: "",
          })
        }

      }
      catch (e) {
        console.warn('Unable to update farm status', e);
      }
    } else {
      return false;
    }

    return true;
  }

  async depositLP(version: number, pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });
      if (state.ctValue[`${version},${pid}`] >= 0) {
        await state.farm[`${version},${pid}`].deposit(state.ctValue[`${version},${pid}`]);
      } else {
        throw "Can't deposit a negative amount.";
      }

      this.updateState({ pending: false });
      this.updateOnce(false).then();
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  async withdrawLP(version: number, pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });
      console.log(`${version},${pid}`)
      if (state.ctValue[`${version},${pid}`] >= 0) {
        await state.farm[`${version},${pid}`].withdraw(state.ctValue[`${version},${pid}`]);
      } else {
        throw "Can't withdraw a negative amount.";
      }

      this.updateState({ pending: false });
      this.updateOnce(false).then();
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  async claimRaptor(version: number, pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });
      await state.farm[`${version},${pid}`].claim();

      this.updateState({ pending: false });
      this.updateOnce(false).then();
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  stakingValueChanged = (event) => {
    var _ctValue = (this.readState().ctValue || {});

    _ctValue[event.target.id] = event.target.value;

    console.log(this.state);

    this.updateState({
      ctValue: _ctValue,
    });
  }

  renderTooltip = (props) => {
    return <Tooltip id="harvest-tooltip" {...props}>
      Claim Rewards
    </Tooltip>
  }

  FarmCard({
    logo,
    pairName,
    fees,
    liquidityPool,
    enableGlow,
    pid,
	version
  }) {
    const ctValue = ((this.readState().ctValue || {})[`${version},${pid}`]);
    const amounts = this.getAmounts(version, pid);
    const apr = amounts["apr"];
    const lpBalance = amounts["lpBalance"];
    const stakedLp = amounts["stakedLp"];
    const rewards = amounts["rewards"];
	const tvl = amounts["tvl"];
	const usdavailable = amounts["usdavailable"];
	const usdstaked = amounts["usdstaked"];
	const usdrewards = amounts["usdrewards"];

    return <div className={`farm-card ${enableGlow ? "glow-div" : ""}`}>
      <div className="gradient-card shadow dark">
        <div className="farm-card-body d-flex justify-content-between">
          <div>
            <div className="d-flex justify-content-between pair-header">
              <img className="lp-pair-icon" src={logo} alt="bnb-raptor-pair" />
              <div>
                <h1 className="text-right">{pairName} LP</h1>
                <h2 className="text-right">{fees}</h2>
              </div>
            </div>
            <hr />
            <div className="d-flex justify-content-between apr">
              <h2>APR: </h2>
              <h2>
                <AnimatedNumber
                  value={numeral(apr || 0).format('0.00')}
                  duration="1000"
                  formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}%`}
                >
                  {apr || 0}
                </AnimatedNumber>
              </h2>
            </div>
			{/*
			<div className="d-flex justify-content-between tvl">
			  <h2>TVL: </h2>
			  <h2>
                <AnimatedNumber
                  value={numeral(tvl || 0).format('0.00')}
                  duration="1000"
                  formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$`}
                >
                  {apr || 0}
                </AnimatedNumber>
			  </h2>
			</div>
			*/}
            <div className="d-flex justify-content-between pool">
              <h2>Liquidity Pool: </h2>
              <h2><u>{liquidityPool}</u></h2>
            </div>
            <h3>Available {pairName} LP</h3>
            <AnimatedNumber
              value={numeral(lpBalance || 0).format('0.000000')}
              duration="1000"
              formatValue={value => `${Number(parseFloat(value).toFixed(6)).toLocaleString('en', { minimumFractionDigits: 6 })}`}
            >
              {lpBalance || 0}
            </AnimatedNumber><AnimatedNumber value={numeral(usdavailable || 0).format('0.00')} formatValue={value => ` (= ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$)`}> (= {usdavailable || 0}$)</AnimatedNumber>
            <div className="rewards-block d-flex justify-content-between">
              <div>
                <h3>Pending Rewards</h3>
                <AnimatedNumber
                  value={numeral(rewards || 0).format('0.00')}
                  duration="1000"
                  formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} Raptor`}
                >
                  {rewards || 0}
                </AnimatedNumber><AnimatedNumber value={numeral(usdrewards || 0).format('0.00')} formatValue={value => ` (= ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$`}> (= {usdrewards || 0}$)</AnimatedNumber>)
              </div>
              <div className="d-flex align-items-center">
                <OverlayTrigger
                  placement="bottom-start"
                  overlay={this.renderTooltip}
                >
                  <button aria-label="harvest button" className="btn btn-harvest stake-claim shadow" disabled={rewards <= 0 || rewards == null} type="button" onClick={async () => this.claimRaptor(version, pid)}>
                    <img src="images/harvest-icon.svg" alt="harvest button icon" />
                  </button>
                </OverlayTrigger>
              </div>
            </div>
            <div className="staked-lp-info">
              <h3>{pairName} LP Staked</h3>
              <AnimatedNumber
                value={numeral(stakedLp || 0).format('0.000000')}
                duration="1000"
                formatValue={value => `${Number(parseFloat(value).toFixed(6)).toLocaleString('en', { minimumFractionDigits: 6 })} LP`}
              >
                {stakedLp || 0}
              </AnimatedNumber>
              <AnimatedNumber
                value={numeral(usdstaked || 0).format('0.00')}
                duration="1000"
                formatValue={value => ` (= ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$)`}
              >
                ({usdstaked || 0}$)
              </AnimatedNumber>
            </div>
          </div>
          <hr />
          <div>
            <div className="d-flex">
              <input className="lp-input" type="number" id={`${version},${pid}`} onChange={(event) => this.stakingValueChanged(event)} value={ctValue || 0} />
            </div>
            <div className="wd-buttons d-flex justify-content-between">
              <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={stakedLp <= 0 || stakedLp == null} type="button" onClick={async () => this.withdrawLP(version, pid)}>Withdraw LP</button>
              <button className="btn btn-primary btn-small link-dark align-self-center stake-claim right" disabled={lpBalance <= 0 || lpBalance == null} type="button" onClick={async () => this.depositLP(version, pid)}>Deposit LP</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  }

  render() {
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="farm-container">

      <div className="row text-white farm-header">
        <div className="col-md-12">
          <div className="farm-title">
            <span>Raptor</span>
            <span style={{ color: "#31c461" }}>Staking</span>
            {state.address ?
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.disconnectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('farm.disconnect_wallet')}
              </a>)
              :
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.connectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('farm.connect_wallet')}
              </a>)
            }
          </div>

          <p>{t('staking.paragraph1')}</p>
          <p><Trans i18nKey='staking.stake'>In order to farm with LP tokens, you need to connect your browser wallet (such as <a
            href="https://metamask.io/">Metamask</a>) and <a
              href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
              target="_blank">Switch to the Binance Smart Chain</a></Trans>.</p>
        </div>
      </div>

      <Container className="farm-body">
        <Row>
          {farmsList.map(farm => {
            return <Col xl={3} lg={4} >
              <this.FarmCard
                logo={farm.logo}
                pairName={farm.pairName}
                fees={farm.fees}
                liquidityPool={farm.liquidityPool}
                enableGlow={farm.enableGlow}
                pid={farm.pid}
				version={farm.version}
              />
            </Col>
          })}
        </Row>
      </Container>
    </div >
  }
>>>>>>> Stashed changes
}

export default withTranslation()(StakingComponent);