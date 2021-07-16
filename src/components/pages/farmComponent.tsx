import * as React from 'react';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { RaptorFarm } from '../contracts/raptorfarm';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';

import './farmComponent.css';

export type FarmProps = {};
export type FarmState = {
		farm?: RaptorFarm,
		wallet?: Wallet,
		looping?: boolean,
		apr?: number,
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

  constructor(props: FarmProps & WithTranslation) {
    super(props);

    this.connectWallet = this.connectWallet.bind(this);
    this.disconnectWallet = this.disconnectWallet.bind(this);
    this.state = {};
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
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="farm-container">
      <div className="row text-white farm-header">
        <div className="col-md-12">
          <div className="farm-title">
            <span>Raptor</span>
            <span style={{ color: "#31c461" }}>Farm</span>
            {state.address ?
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('farm.disconnect_wallet')}
              </a>)
              :
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('farm.connect_wallet')}
              </a>)
            }
          </div>

          <p>{t('farm.paragraph1')}</p>
          <p><Trans i18nKey='farm.paragraph2'>In order to farm with LP tokens, you need to connect your browser wallet (such as <a
            href="https://metamask.io/">Metamask</a>) and <a
              href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
              target="_blank">Switch to the Binance Smart Chain</a></Trans>.</p>
        </div>
      </div>

      <div className="farm-body">
        <div className="gradient-card primary">
          <div className="d-flex justify-content-between pair-header">
            <img className="lp-pair-icon" src="images/bnb-raptor.png" alt="bnb-raptor-pair" />
            <div>
              <h1 className="text-right"><strong>RAPTOR-BNB LP</strong></h1>
              <h3 className="text-right">NO FEES</h3>
            </div>
          </div>
          <h2>APR: </h2>
          <h3>Available RAPTOR-BNB LP</h3>
          <p>{state.lpbalance || 0}</p>
          <h3>RAPTOR-BNB LP Staked</h3>
          <p>{state.stakedlp || 0}</p>
          <div className="wd-buttons d-flex justify-content-end">
            <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={state.stakedlp <= 0 || state.stakedlp == null} type="button" onClick={async () => this.withdrawLP()}>Withdraw LP</button>
            <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={state.lpbalance <= 0 || state.stakedlp == null} type="button" onClick={async () => this.depositLP()} style={{ marginLeft: "16px" }}>Deposit LP</button>
          </div>
          <h3>Pending Rewards</h3>
          <p>{state.rewards || 0}</p>
          <div className="d-flex justify-content-end">
            <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={state.stakedlp <= 0 || state.stakedlp == null} type="button" onClick={async () => this.withdrawLP()}>Harvest Raptor</button>
          </div>
        </div>
      </div>
    </div>
  }
}

export default withTranslation()(FarmComponent);
