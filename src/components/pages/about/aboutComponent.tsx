import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../../shellInterfaces';
import { Fade, Slide } from 'react-reveal';
import { pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';

import '../paddings.css';
import './aboutComponent.css';

export type AboutProps = {};
export type AboutState = {};

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 8s ${PulseAnimation};
`;

const ProductsOverviewDiv = React.lazy(() => import('./productsOverview'));
const TeamDiv = React.lazy(() => import('./team'));

class aboutComponent extends BaseComponent<AboutProps & WithTranslation, AboutState> {

  constructor(props) {
    super(props);
  }

  render() {
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="about-container">
      <div className="d-flex flex-row container" style={{ padding: "0px" }}>
        <div style={{ marginRight: "4%" }}>
          <section id="mission">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <h1><strong>{t('about.raptor_finance.title')}</strong></h1>
                  <p>{t('about.raptor_finance.paragraph1')}</p>
                  <p>{t('about.raptor_finance.paragraph2')}</p>
                  <p>{t('about.raptor_finance.paragraph3')}</p>
                  <p>{t('about.raptor_finance.our_plan.title')}</p>
                  <ul>
                    <li>{t('about.raptor_finance.our_plan.line1')}</li>
                    <li>{t('about.raptor_finance.our_plan.line2')}</li>
                    <li>{t('about.raptor_finance.our_plan.line3')}</li>
                    <li>{t('about.raptor_finance.our_plan.line4')}</li>
                    <li>{t('about.raptor_finance.our_plan.line5')}</li>
                  </ul>
                  <ProductsOverviewDiv />
                </div>
              </div>
            </div>
          </section>
        </div>
        <Slide right>
          <div className="d-none d-lg-flex sticky-top col-3" id="sidebar">
            <PulseDiv className="align-self-start gradient-card primary">
              <div className="background"><img src="images/logo-rp-u.svg" alt="raptor-logo-svg" /></div>
              <h1><strong>{t('about.card_right.title')}</strong></h1>
              <p>{t('about.card_right.desc')}</p>
              <a className="link-dark" href="#mission">{t('about.card_right.mission')}</a>
              <a className="link-dark" href="#products-overview">{t('about.card_right.products')}</a>
              <a className="link-dark" href="#team">{t('about.card_right.team')}</a>
            </PulseDiv>
          </div>
        </Slide>
      </div>
    </div>
  }
}

export default withTranslation()(aboutComponent);
