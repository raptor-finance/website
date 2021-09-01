import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';

export type MigrationProps = {};
export type MigrationState = {
	raptor?: Raptor,
	wallet?: Wallet,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	balance?: number
};

class MigrationComponent extends BaseComponent<MigrationProps & WithTranslation, MigrationState> {
	constructor(props: MigrationProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
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
				});

				if (resetCt) {
					this.updateState({
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
	
	async componentDidMount() {
	}

	componentWillUnmount() {
	}
	
	handleAmountUpdate(event) {
		this.updateState({ ctValue:event.target.value });
	}
	
	async migrate() {
		raptor = this.readState().raptor;
		await raptor.migrate(ctValue);
	}

	render() {
		const t: TFunction<"translation"> = this.readProps().t;
		const state = this.readState();
		return <div>
			<div className="container">
				<br/><br/><br/>
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
			</div>
			<div className="container">
				<div>
					Old raptor balance : {state.balance || 0}
				</div>
				<div>
					<input onChange={this.handleAmountUpdate} value={state.ctValue}></input><button onClick={this.migrate}>Migrate</button>
				</div>
			</div>
		</div>
	}
}

export default withTranslation()(MigrationComponent);