import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { Wallet } from '../../wallet';
import { RaptorFarm } from '../../contracts/raptorfarm';
import { RaptorFarmNew } from '../../contracts/raptorfarmnew';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { Tooltip, OverlayTrigger, Container, Row, Col } from 'react-bootstrap';
import AnimatedNumber from 'animated-number-react';

import './farmComponent.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import { farmsList } from '../../listOfFarms';

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
      const result = await wallet.connect(56);

      if (!result) {
        throw 'The wallet connection was cancelled.';
      }

      const state = this.readState();
      const farm = state.farm;
	  console.log(state);
      const poolLengthNew = (await farm[`1,0`].contractView.methods.poolLength().call());

      for (let i=0; i < poolLengthNew; i++) {
        farm[`1,${i}`].connectWallet(wallet);
		await farm[`1,${i}`].refresh();
        i += 1;
      }

      await this.updateState({ wallet: wallet, looping: true });
      await this.updateOnce(false);
      await this.updateState({ pending: false });
      this.loop().then();
    }
    catch (e) {
	  console.error(`Raptor Staking: Error connecting wallet: ${e}`);
      this.updateState({ pending: false });
      this.handleError(e);
    }
  }

  getFarm(pid: string) {
	  return ((this.readState().farm || {})[pid]);
  }

  getAmounts(version: number, pid: number) {
	const strpid = `${version},${pid}`;
	const farminfo = this.getFarm(strpid);
	if (farminfo == undefined) {
		return;
	}
    let amounts = {};
    amounts["apr"] = farminfo.apr;
    amounts["lpBalance"] = farminfo.lpBalance;
    amounts["stakedLp"] = farminfo.stakedLp;
    amounts["rewards"] = farminfo.rewards;
    amounts["tvl"] = farminfo.tvl;
    amounts["usdavailable"] = farminfo.usdavailable;
    amounts["usdstaked"] = farminfo.usdstaked;
    amounts["usdrewards"] = farminfo.usdrewards;
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
    await this.updateState({ pending: true });
	let farm = {};
	farm[`1,0`] = new RaptorFarmNew(0);
	await farm[`1,0`]._setupFinished;
	await farm[`1,0`].refresh();

	const poolLengthNew = (await farm[`1,0`].contractView.methods.poolLength().call());
	var i = 1;
	while (i < poolLengthNew) {
	  let f = new RaptorFarmNew(i)
      farm[`1,${i}`] = f;
	  await f._setupFinished
      i += 1;
    }
    await this.updateState({ farm: farm });
	
    if ((window.ethereum || {}).selectedAddress) {
      this.connectWallet();
    }
	await this.updateState({ pending: false });
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
    const state = this.readState();
    const farm = state.farm;
	// const poolLengthOld = (await farm["0,0"].contract.methods.poolLength().call());
	const poolLengthNew = (await farm["1,0"].contract.methods.poolLength().call());
    if (!!farm) {
      try {
        for (let j = 0; j < poolLengthNew-1; j++) {
          farm[`1,${j}`].refresh();
        }
		
		await farm[`1,${poolLengthNew-1}`].refresh();
		
        if (!this.readState().looping) {
          return false;
        }
        this.updateState({
          address: state.wallet?state.wallet._address:undefined,
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
	version,
	addLiquidityURL
  }) {
    const ctValue = ((this.readState().ctValue || {})[`${version},${pid}`]);
    const amounts = this.getAmounts(version, pid);
	
	let apr = 0;
	let lpBalance = 0;
	let stakedLp = 0;
	let rewards = 0;
	let tvl = 0;
	let usdavailable = 0;
	let usdstaked = 0;
	let usdrewards = 0;
	
	if (amounts) {
		apr = amounts["apr"];
		lpBalance = amounts["lpBalance"];
		stakedLp = amounts["stakedLp"];
		rewards = amounts["rewards"];
		tvl = amounts["tvl"];
		usdavailable = amounts["usdavailable"];
		usdstaked = amounts["usdstaked"];
		usdrewards = amounts["usdrewards"];
	}

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
            <div className="d-flex justify-content-between pool">
              <h2>Liquidity Pool: </h2>
              <h2><a href={addLiquidityURL}><u>{liquidityPool}</u></a></h2>
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
              <input className="lp-input" type="number" id={`${version},${pid}`} onChange={(event) => this.stakingValueChanged(event)} value={ctValue || ""} />
            </div>
            <div className="wd-buttons d-flex justify-content-between">
              <button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={stakedLp <= 0 || stakedLp == null} type="button" onClick={async () => this.withdrawLP(version, pid)}>Withdraw LP</button>
              <button className="btn btn-primary btn-small link-dark align-self-center stake-claim right" disabled={lpBalance <= 0 || lpBalance == null} type="button" onClick={async () => this.depositLP(version, pid)}>Deposit LP</button>
            </div>
          </div>
		  <div>
			<iframe data-aa='2131703' src='//acceptable.a-ads.com/2131703' style={{border:"0px", "margin-top": "15px", "border-radius": "5px", padding:0, width:"100%", height:"100px", overflow:"hidden", "background-color": "transparent"}}></iframe>
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

          <p>{t('farm.paragraph1')}</p>
          <p><Trans i18nKey='farm.paragraph2'>In order to farm with LP tokens, you need to connect your browser wallet (such as <a
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
				addLiquidityURL={farm.addLiquidityURL}
              />
            </Col>
          })}
        </Row>
      </Container>
    </div >
  }
}

export default withTranslation()(FarmComponent);
