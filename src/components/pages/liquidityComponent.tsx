import * as React from 'react';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';

import './liquidityComponent.css';

export type LiquidityProps = {};
export type LiquidityState = {
  wallet?: Wallet,
  looping?: boolean,
  address?: string,
  pending?: boolean,
}

class LiquidityComponent extends BaseComponent<LiquidityProps & WithTranslation, LiquidityState> {

  constructor(props: LiquidityProps & WithTranslation) {
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

      this.updateState({
        wallet: wallet,
        looping: true,
        pending: false,
      });
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

      this.updateState({
        wallet: null,
        address: null,
        looping: false,
        pending: false,
      });
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  async componentDidMount() {

  }

  render() {
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="liquidity-container">
      <div className="row text-white liquidity-header">
        <div className="col-md-12">
          <div className="liquidity-title">
            <span>Raptor</span>
            <span style={{ color: "#31c461" }}>Liquidity</span>
            {state.address ?
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('liquidity.disconnect_wallet')}
              </a>)
              :
              (<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}>
                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
                {t('liquidity.connect_wallet')}
              </a>)
            }
          </div>

          <p>{t('liquidity.paragraph1')}</p>
        </div>
      </div>

      <div className="liquidity-body d-flex">
        <div className="liquidity-swap-card gradient-card dark shadow">
          <div className="liquidity-swap-header d-flex justify-content-between">
            <div>
              <h1 className="">Add Liquidity</h1>
              <h2 className="">Add liquidity to receive LP tokens</h2>
            </div>
            <div className="d-flex align-items-start">
              <button className="btn-settings"><img src="images/settings-icon.png" /></button>
            </div>
          </div>
          <hr />
          <div className="liquidity-swap-body">
            <div className="liquidity-input">
              <div className="d-flex justify-content-between">
                <p>Input</p>
                <p>Balance: 1 BNB</p>
              </div>
              <div className="d-flex justify-content-between">
                <input placeholder="0.0" />
                <button className="btn-currency-select">Select a currency</button>
              </div>
            </div>
            <h3 className="text-center">+</h3>
            <div className="liquidity-input">
              <div className="d-flex justify-content-between">
                <p>Input</p>
                <p>Balance: 1 BNB</p>
              </div>
              <div className="d-flex justify-content-between">
                <input placeholder="0.0" />
                <button className="btn-currency-select">Select a currency</button>
              </div>
            </div>
          </div>
          <hr />
          <div className="liquidity-swap-footer d-flex">
            <button className="btn btn-golden shadow">Supply</button>
          </div>
        </div>
      </div>
    </div>
  }
}

export default withTranslation()(LiquidityComponent);
