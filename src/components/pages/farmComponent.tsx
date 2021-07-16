import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';
import { RaptorFarm } from '../contracts/raptorfarm';


import './farmComponent.css';

export type FarmProps = {};
export type FarmState = {
		farm?: RaptorFarm,
		wallet?: Wallet,
		looping?: boolean,

		address?: string,
		balance?: number,
		lpbalance?: number,
		stakedlp?: number,
		rewards?: number,
		ctValue?: number,
		pending?:boolean,
	}
};

class FarmComponent extends BaseComponent<FarmProps & WithTranslation, FarmState> {

	constructor(props) {
		super(props);
	}
	
	async connectWallet() {

		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const farm = new RaptorFarm(wallet);

			this.updateState({ farm: farm, wallet: wallet, looping: true, pending: false });
			this.updateOnce().then();

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

			this.updateState({ lottery: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}



	async componentDidMount() {

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

	
	
	private async updateOnce(): Promise<boolean> {
		const farm = this.readState().farm;

		if (!!farm) {
			try {
				await farm.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: farm.wallet.currentAddress,
					balance: farm.raptor.balance,
					stakedlp: farm.stakedlp,
					lpbalance: farm.lpbalance,
					rewards: farm.rewards,
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

	
	async depositLP(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (state.ctValue >= 0) {
				await state.raptor.deposit(state.ctValue);
			}
			else {
				NotificationManager.warning("Can't deposit a negative amount.");
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
  
	async withdrawLP(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (state.ctValue >= 0) {
				await state.raptor.withdraw(state.ctValue);
			}
			else {
				NotificationManager.warning("Can't withdraw a negative amount.");
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
	
	async claimRaptor(): Promise<void> {
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

  render() {
    const t: TFunction<"translation"> = this.readProps().t;
    return <div>
		Available lp : {state.lpbalance}</br>
		Staked LP : {state.stakedlp}</br>
		RAPTOR balance : {state.balance}
		Pending rewards : {state.rewards}
		<input type="number" value={state.ctValue || 0} />
		<button type="button" onClick={async () => this.depositLP()}>Deposit</button>
		<button type="button" onClick={async () => this.withdrawLP()}>Withdraw</button>
		<button type="button" onClick={async () => this.claimRaptor()}>Claim raptor</button>
    </div>
  }
}

export default withTranslation()(FarmComponent);
