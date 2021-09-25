import * as React from 'react';

import { BaseComponent } from '../../shellInterfaces';
import { RaptorStatistics } from '../../contracts/statistics';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';

import './tokenStatistics.css';

export type TokenStatisticsProps = {};
export type TokenStatisticsState = {
  exit?: boolean;
  priceUsd?: number;
  marketCapUsd?: number;
  totalSupply?: number;
};

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 3s ${PulseAnimation};
`;

class TokenStatistics extends BaseComponent<TokenStatisticsProps & WithTranslation, TokenStatisticsState> {

  private readonly _statistics: RaptorStatistics;
  private _timeout = null;

  constructor(props: TokenStatisticsProps & WithTranslation) {
    super(props);
    this.state = {
      priceUsd: 0,
      marketCapUsd: 0,
      totalSupply: 0,
    };
    this._statistics = new RaptorStatistics();
  }

  componentDidMount() {
    console.log('mount');
    this.tick();
  }

  componentWillUnmount() {
    if (!!this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    this.setState({ exit: true });
  }

  async tick() {
    const self = this;
    const state = this.readState();

    if (state.exit) {
      return;
    }

    await this._statistics.refresh();

    this.setState({
      priceUsd: this._statistics.raptorUsdPrice,
      marketCapUsd: this._statistics.marketCapUsd,
      totalSupply: this._statistics.totalSupply,
    });

    this._timeout = setTimeout(async () => await self.tick.call(self), 60000);
  }

  convert(n) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n.toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal
      : sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))) : (decimal.slice(0, +pow) + "." + decimal.slice(+pow)))
  }

  handleChange = ({ target: {
    priceUsd,
  } }) => {
    this.setState({
      priceUsd,
    });
  };

  render() {
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="d-flex statistics">
      <div className="stat">
        <PulseDiv>
          <AnimatedNumber value={this.state.marketCapUsd} duration="1000" formatValue={value => `$${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })}`} className="stat-value">
            0
          </AnimatedNumber>
        </PulseDiv>
        <h2>Market Cap</h2>
      </div>
      <div className="stat">
        <PulseDiv>
          <AnimatedNumber value={this.convert(+state.priceUsd)} duration="1000" formatValue={value => `$${Number(value).toFixed(7)}`} className="stat-value">
            0
          </AnimatedNumber>
        </PulseDiv>
        <h2>{t('home.token_statistics.price_usd')}</h2>
      </div>
      <div className="stat">
        <PulseDiv>
          <AnimatedNumber value={1} duration="2000" formatValue={value => `${Number(value).toFixed(0)}k +`} className="stat-value">
            0
          </AnimatedNumber>
        </PulseDiv>
        <h2>Holders</h2>
      </div>
      <div className="stat">
        <PulseDiv>
          <AnimatedNumber value={this.convert(this.state.totalSupply)} duration="1000" formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })}`} className="stat-value">
            0
          </AnimatedNumber>
        </PulseDiv>
        <h2>Total Supply</h2>
      </div>
    </div>
  }
};

export default withTranslation()(TokenStatistics);
