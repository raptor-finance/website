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
		<input type="number" value={state.ctValue || 0} />
		<button type="button" onClick={async () => this.depositLP()}>Deposit</button>
		<button type="button" onClick={async () => this.withdrawLP()}>Withdraw</button>
		<button type="button" onClick={async () => this.withdrawLP()}>Claim raptor</button>
    </div>
  }
}

export default withTranslation()(FarmComponent);
