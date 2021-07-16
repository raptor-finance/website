import * as React from 'react';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
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
		amount?: number,
		rewards?: number,
		ctValue?: number,
		pending?:boolean
}

class FarmComponent extends BaseComponent<FarmProps & WithTranslation, FarmState> {

	constructor(props) {
		super(props);
	}

	handleError(error) {
		ShellErrorHandler.handle(error);
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

			this.updateState({ farm: null, wallet: null, address: null, looping: false, pending: false });
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

	
	
	private async updateOnce(resetCt?: boolean): Promise<boolean> {
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
				console.warn('Unable to update farm status', e);
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
				await state.farm.deposit(state.ctValue);
			}
			else {
				throw "Can't deposit a negative amount.";
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
				await state.farm.withdraw(state.ctValue);
			}
			else {
				throw "Can't withdraw a negative amount.";
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
	
	stakingValueChanged = (event) => {
		this.updateState({ ctValue: event.target.value });
		
	}
	
	
	async claimRaptor(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });
			await state.farm.claim();

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

  render() {
	const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;
    return <div className="farm-container">
		<div className="container">
			<button type="button" onClick={async () => this.connectWallet()}>Connect wallet</button>
			<div>Available lp : {state.lpbalance}</div>
			<div>Staked LP : {state.stakedlp}</div>
			<div>RAPTOR balance : {state.balance}</div>
			<div>Pending rewards : {state.rewards}</div>
			<input type="number" onChange={(event)=>this.stakingValueChanged(event)} value={state.ctValue || 0} />
			<div>
			<button type="button" onClick={async () => this.depositLP()}>Stake LP</button>
			<button type="button" onClick={async () => this.withdrawLP()}>Withdraw LP</button>
			<button type="button" onClick={async () => this.claimRaptor()}>Claim raptor</button>
			</div>
		</div>
    </div>
  }
}

export default withTranslation()(FarmComponent);
