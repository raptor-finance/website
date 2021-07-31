import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { RaptorFarm } from '../contracts/raptorfarm';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import AnimatedNumber from 'animated-number-react';

import './farmComponent.css';

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
  pending?: boolean
}

class FarmComponent extends BaseComponent<FarmProps & WithTranslation, FarmState> {

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
      const wallet = new Wallet();
      const result = await wallet.connect();

      if (!result) {
        throw 'The wallet connection was cancelled.';
      }

      var farm = {};
      farm[0] = new RaptorFarm(wallet, 0);
      await farm[0].finishSetup();

      const poolLength = (await farm[0].contract.methods.poolLength().call());
      var i = 1;
      while (i < poolLength) {
        farm[i] = new RaptorFarm(wallet, i);
        await farm[i].finishSetup();
        i += 1;
      }

      this.updateState({ farm: farm, wallet: wallet, looping: true, pending: false });
      this.updateOnce(false).then();

      this.loop().then();
    }
    catch (e) {
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  getLpBalance(pid: number): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.lpBalance || 0);
    }
  }

  getStakedBalance(pid: number): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.stakedLp || 0);
    }
  }

  getRewards(pid: number): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.rewards || 0);
    }
  }

  getApr(pid: number): number {
    const farmInfo = ((this.readState().farm || {})[pid]);
    if (farmInfo == undefined) {
      return 0;
    }
    else {
      return (farmInfo.apr || 0);
    }
  }

  getAmounts(pid: number) {
    var amounts = {};
    amounts["apr"] = this.getApr(pid);
    amounts["lpBalance"] = this.getLpBalance(pid);
    amounts["stakedLp"] = this.getStakedBalance(pid);
    amounts["rewards"] = this.getRewards(pid);
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

    if (!!farm) {
      try {
        var i = 0
        while (farm[i] != undefined) {
          await farm[i].refresh();
          i += 1;
        }
        if (!this.readState().looping) {
          return false;
        }
        this.updateState({
          address: farm[0].wallet.currentAddress,
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

  async depositLP(pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });

      if (state.ctValue[pid] >= 0) {
        await state.farm[pid].deposit(state.ctValue[pid]);
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

  async withdrawLP(pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });

      if (state.ctValue[pid] >= 0) {
        await state.farm[pid].withdraw(state.ctValue[pid]);
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

  async claimRaptor(pid: number): Promise<void> {
    try {
      const state = this.readState();
      this.updateState({ pending: true });
      await state.farm[pid].claim();

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
    pid
  }) {
    const ctValue = ((this.readState().ctValue || {})[pid]);
    const amounts = this.getAmounts(pid);
    const apr = amounts["apr"];
    const lpBalance = amounts["lpBalance"];
    const stakedLp = amounts["stakedLp"];
    const rewards = amounts["rewards"];

    return <div className="col-md-3">
      <div className={`farm-card ${enableGlow ? "glow-div" : ""}`}>
        <div className="gradient-card shadow dark">
          <div className="farm-card-body d-flex justify-content-between">
            <div>
              <div className="d-flex justify-content-between pair-header">
                <img className="lp-pair-icon" src={logo} alt="bnb-raptor-pair" />
                <div>
                  <h1 className="text-right">{pairName} LP</h1>
                  <h3 className="text-right">{fees}</h3>
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
              </AnimatedNumber>
              <div className="rewards-block d-flex justify-content-between">
                <div>
                  <h3>Pending Rewards</h3>
                  <AnimatedNumber
                    value={numeral(rewards || 0).format('0.00')}
                    duration="1000"
                    formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} Raptor`}
                  >
                    {rewards || 0}
                  </AnimatedNumber>
                </div>
                <div className="d-flex align-items-center">
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={this.renderTooltip}
                  >
                    <button className="btn btn-harvest stake-claim shadow" disabled={rewards <= 0 || rewards == null} type="button" onClick={async () => this.claimRaptor(pid)}>
                      <img src="images/harvest-icon.svg" />
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
              <div className="staked-lp-info">
                <h3>{pairName} LP Staked</h3>
                <AnimatedNumber
                  value={numeral(stakedLp || 0).format('0.000000')}
                  duration="1000"
                  formatValue={value => `${Number(parseFloat(value).toFixed(6)).toLocaleString('en', { minimumFractionDigits: 6 })} LP Tokens`}
                >
                  {stakedLp || 0}
                </AnimatedNumber>
              </div>
            </div>
            <hr />
            <div>
              <div className="d-flex">
                <input className="lp-input" type="number" id={pid} onChange={(event) => this.stakingValueChanged(event)} value={ctValue || 0} />
              </div>
              <div className="wd-buttons d-flex justify-content-between">
                <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={stakedLp <= 0 || stakedLp == null} type="button" onClick={async () => this.withdrawLP(pid)}>Withdraw LP</button>
                <button className="btn btn-primary btn-small link-dark align-self-center stake-claim" disabled={lpBalance <= 0 || lpBalance == null} type="button" onClick={async () => this.depositLP(pid)} style={{ marginLeft: "16px" }}>Deposit LP</button>
              </div>
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

      <div className="farm-body d-flex">
        <this.FarmCard
          logo="images/dai-raptor.png"
          pairName="RAPTOR-DAI"
          fees="NO FEES"
          liquidityPool="Raptor"
          enableGlow={true}
          pid={3}
        />
        <this.FarmCard
          logo="images/busd-raptor.png"
          pairName="RAPTOR-BUSD"
          fees="NO FEES"
          liquidityPool="Raptor"
          enableGlow={true}
          pid={2}
        />
        <this.FarmCard
          logo="images/usdt-raptor.png"
          pairName="RAPTOR-USDT"
          fees="NO FEES"
          liquidityPool="Raptor"
          enableGlow={true}
          pid={1}
        />
        <this.FarmCard
          logo="images/bnb-raptor.png"
          pairName="RAPTOR-BNB"
          fees="NO FEES"
          liquidityPool="Pancake"
          enableGlow={false}
          pid={0}
        />
      </div>
    </div>
  }
}

export default withTranslation()(FarmComponent);
