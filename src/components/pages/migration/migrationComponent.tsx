import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import './migrationComponent.css';

export type MigrationProps = {};
export type MigrationState = {
	raptor?: Raptor,
	wallet?: Wallet,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	balance?: number,
	balancev3?: number,
	ctValue?: number,
	ctValueOut?: number
};

class MigrationComponent extends BaseComponent<MigrationProps & withTranslation, MigrationState> {
	
	private lock: boolean;
	
	constructor(props: MigrationProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.migrate = this.migrate.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.state = {};
	}
	
	handleError(error) {
		ShellErrorHandler.handle(error);
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
					balancev3: raptor.balancev3,
				});

				if (resetCt) {
					this.updateState({
					})
				}

			}
			catch (e) {
				console.warn('Unable to update migration status', e);
			}
		}
		else {
			return false;
		}
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

			this.updateState({ raptor: raptor, wallet: wallet, looping: true, pending: false, ctValue: 0 });
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
	
	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
		  this.connectWallet();
		}
	}

	componentWillUnmount() {
	}
	
	handleAmountUpdate(event) {
		let valueIn = event.target.value;
		let valueOut = (event.target.value/10**6);
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	handleAmountOutUpdate(event) {
		let valueIn = (event.target.value*(10**6));
		let valueOut = event.target.value;
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	setMaxAmount() {
		const state = this.readState();
		let valueIn = state.balance;
		let valueOut = state.balance/10**6;
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	async migrate() {
		let state = this.readState();
		console.log(state);
		await state.raptor.migrate(state.ctValue);
		await state.raptor.refresh();
		this.updateOnce(true);
	}
	
	async addToMetamask() {
		await ethereum.request({method: 'wallet_watchAsset',params: {type: 'ERC20',options: {address: "0x44c99ca267c2b2646ceec72e898273085ab87ca5",symbol: "RPTR",decimals: 18,image: "http://localhost:3000/images/logo.png",},},});
	}

	render() {
		const t: TFunction<"translation"> = this.readProps().t;
		const state = this.readState();
		return <div>
			<div className="migration-container">
				<div className="row text-white migration-header">
					<div className="col-md-12">
						<div className="migration-title">
							<span>Raptor</span>
							<span style={{ color: "#31c461" }}>Migration</span>
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
					</div>
				</div>
				<div className="row migration-body text-center">
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<div>
								<div>Old raptor (avbl. : {state.balance || 0})</div>
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.ctValue}></input><button className="btns-migrate" id="btn-max" onClick={this.setMaxAmount}>Max</button>
							</div>
							<div>
								<div>New raptor (avbl. : {state.balancev3 || 0})</div>
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountOutUpdate} value={state.ctValueOut}></input>
							</div>
							<div id="buttons">
								<button id="btn-migrate" className="btns-migrate" onClick={this.migrate}>Migrate</button><button id="btn-addtometa" className="btns-migrate" onClick={this.addToMetamask}>Add to metamask</button>
							</div>
							<div className="migration-footer text-center">
								<font size="2"><i>Note : Migration is only old to new !</i></font>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation()(MigrationComponent);