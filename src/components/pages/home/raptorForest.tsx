import * as React from 'react';

import { BaseComponent } from '../../shellInterfaces';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { fadeIn } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';

import './raptorForest.css';

export type RaptorForestProps = {};
export type RaptorForestState = {
  treeAge?: number;
  exit?: boolean;
  treeAmount?: number;
  carbonOffset?: number;
};

const FadeInAnimation = keyframes`${fadeIn}`;
const FadeInDiv = styled.div`
  animation: ease-in 0.4s ${FadeInAnimation};
`;

class RaptorForest extends BaseComponent<RaptorForestProps & WithTranslation, RaptorForestState> {

  private readonly plantDate: Date = new Date("05/18/2021");
  private _timeout = null;

  constructor(props: RaptorForestProps & WithTranslation) {
    super(props);
    this.state = {
      treeAge: 0,
      treeAmount: 0,
      carbonOffset: 0,
    };
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

    const timeDelta = new Date().getTime() - this.plantDate.getTime();
    const dayDelta = Math.floor(timeDelta / (1000 * 3600 * 24));

    this.setState({
      treeAge: dayDelta,
    });

    fetch("https://api.perseusoft.tech/raptoradmin/raptorservices/crypto/info/0xf9a3fda781c94942760860fc731c24301c83830a")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            treeAmount: result.plantedTree.trees,
            carbonOffset: result.plantedTree.carbonOffset
          });
        },
        (err) => {
          console.error("Error fetching data from ecologi API", err);
        }
      )

    this._timeout = setTimeout(async () => await self.tick.call(self), 60000);
  }

  handleChange = ({ target: {
    treeAge,
    treeAmount,
    carbonOffset,
  } }) => {
    this.setState({
      treeAge,
      treeAmount,
      carbonOffset,
    });
  };

  render() {
    const t: TFunction<"translation"> = this.readProps().t;

    return <FadeInDiv>
      <div className="shadow d-flex flex-row align-self-center flex-wrap gradient-card primary raptor-forest">
        <h2 className="flex-fill"><strong>{t('home.raptor_forest.title')}</strong></h2>
        <p><Trans i18nKey='home.raptor_forest.funder'><strong>Funded by: </strong>
          <span>Raptor Finance</span></Trans>
        </p>
        <p><strong>{t('home.raptor_forest.age')} </strong>
          <AnimatedNumber value={this.state.treeAge} duration="1000" formatValue={value => `${Number(value).toFixed(0)}d`}>
            {t('home.raptor_forest.day', { count: this.readState().treeAge })}
          </AnimatedNumber>
        </p>
        <p><strong>{t('home.raptor_forest.co2_offset')} </strong>
          <AnimatedNumber value={this.state.carbonOffset} duration="1000" formatValue={value => `${Number(value).toFixed(2)}t`}>
            {this.readState().carbonOffset} {t('home.raptor_forest.tonnes')}
          </AnimatedNumber>
        </p>
        <p><strong>{t('home.raptor_forest.species')} </strong>
          <AnimatedNumber value="8" duration="1000" formatValue={value => `${Number(value).toFixed(0)}`}>
            0
          </AnimatedNumber>
        </p>
        <p><strong>{t('home.raptor_forest.tree_amount')} </strong>
          <AnimatedNumber value={this.state.treeAmount} duration="1000" formatValue={value => `${Number(parseFloat(value).toFixed(0)).toLocaleString('en', { minimumFractionDigits: 0 })}`}>
            {this.readState().treeAmount}
          </AnimatedNumber>
        </p>
        <p><strong>{t('home.raptor_forest.planting_projects')} </strong>
          <AnimatedNumber value="2" duration="1000" formatValue={value => `${Number(value).toFixed(0)}`}>
            0
          </AnimatedNumber>
        </p>
        <p><strong>{t('home.raptor_forest.our_forest')} 🌳: </strong>
          <span><strong><a className="title-white" href="https://ecologi.com/raptorfinance" rel="noreferrer">{t('home.raptor_forest.click_here')}</a></strong></span></p>
      </div>
    </FadeInDiv>
  }
};

export default withTranslation()(RaptorForest);
