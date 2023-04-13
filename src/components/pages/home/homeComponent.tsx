import * as React from 'react';

import { Suspense } from 'react';
import { BaseComponent } from '../../shellInterfaces';
import { DonationWalletAddress } from '../../contracts/raptor';
import { RaptorStatistics } from '../../contracts/statistics';
import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { Fade, Slide } from 'react-reveal';
import { PuffLoader, PropagateLoader } from 'react-spinners';
import AnimatedNumber from 'animated-number-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMedium, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faReddit } from '@fortawesome/free-brands-svg-icons/faReddit';
import { faTiktok } from '@fortawesome/free-brands-svg-icons/faTiktok';
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube';
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord';

import './homeComponent.css';

export type HomeProps = {};
export type HomeState = {
  exit?: boolean;
  donationBalance?: number;
};

const RoadmapDiv = React.lazy(() => import('./roadmap'));
const RaptorAppDiv = React.lazy(() => import('./raptorApp'));
const RaptorForestDiv = React.lazy(() => import('./raptorForest'));
const TokenStatisticsDiv = React.lazy(() => import('./tokenStatistics'));

class HomeComponent extends BaseComponent<HomeProps & WithTranslation, HomeState> {

  private readonly _statistics: RaptorStatistics;

  private _timeout = null;

  constructor(props: HomeProps & WithTranslation) {
    super(props);
    this.state = {
      donationBalance: 0,
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
      donationBalance: this._statistics.donationWalletBalance,
    });

    this._timeout = setTimeout(async () => await self.tick.call(self), 60000);
  }

  handleChange = ({ target: {
    donationBalance,
  } }) => {
    this.setState({
      donationBalance,
    });
  }

  render() {
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="home-container shadow">
      <div className="container">
        <section className="intro">
          <div className="row d-flex justify-content-between">
            <div className="col-md-7">
              <h1><strong className="title-white">{t('home.subtitle1')}</strong><br /></h1>
              <p>{t('home.paragraph1')}</p>
              <p>{t('home.paragraph1_end')}</p>
              <div className="d-flex flex-sm-column flex-lg-row hero-buttons">
                <Slide left>
                  <a className="shadow btn btn-golden btn-lg" role="button" href="/whitepaper.pdf" target="_blank">{t('home.our_docs')}</a>
                </Slide>
              </div>
            </div>
            <div className="col-md-5">
              <Suspense fallback={<PuffLoader color={'#ffffff'} />}>
                <RaptorForestDiv />
              </Suspense>
            </div>
          </div>
		  
		  {/*
          <div className="second-paragraph">
            <h1><strong className="title-white">{t('home.subtitle2')}</strong><br /></h1>
            <p>{t('home.paragraph2')} <a href="home#roadmap">{t('home.roadmap')}</a> {t('home.for_details')}</p>
            <p>{t('home.paragraph3')} <a href={`https://bscscan.com/address/${DonationWalletAddress}`} target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace', wordBreak: "break-word" }}>{DonationWalletAddress}</a></p>
            <p>
              {t('home.paragraph4_1')}
              <AnimatedNumber
                value={this.state.donationBalance}
                duration="1000"
                formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
              >
                {this.readState().donationBalance}
              </AnimatedNumber>
              {t('home.paragraph4_2')}
            </p>
          </div>
		  */}
        </section>

        <section className="token-stats">
          <Suspense fallback={<PropagateLoader color={'#ffffff'} />}>
            <Fade>
              <TokenStatisticsDiv />
            </Fade>
          </Suspense>
        </section>

        <section id="roadmap">
          <Suspense fallback={<PropagateLoader color={'#ffffff'} />}>
            <RoadmapDiv />
          </Suspense>
        </section>
        <section className="raptor-app">
          <Suspense fallback={<PropagateLoader color={'#ffffff'} />}>
            <RaptorAppDiv />
          </Suspense>
        </section>
        <section className="social-icons">
          <Suspense fallback={<PropagateLoader color={'#ffffff'} />}>
            <Fade>
              <div>
                <div className="text-center">
                  <p>Join our socials</p>
                </div>
                <div className="social-medias text-center text-lg-left">
                  <a href="https://twitter.com/raptorchainio" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                  <a href="https://t.me/RaptorSwap" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faTelegram} />
                  </a>
                  <a href="https://www.facebook.com/RaptorSwap  " rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                  <a href="https://www.instagram.com/rptrarmy/" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="https://www.reddit.com/r/RaptorToken/" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faReddit} />
                  </a>
                  <a href="https://tiktok.com/@raptorswap" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                  <a href="https://www.youtube.com/channel/UCgLBdvV2BiTy6nwTuWdUeKg" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                  <a href="https://discord.gg/EJwR3pjd9A" rel="noreferrer" className="btn-social" target="_blank">
                    <FontAwesomeIcon icon={faDiscord} />
                  </a>
                </div>
              </div>

            </Fade>
          </Suspense>
        </section>
      </div>
    </div >
  }
}

export default withTranslation()(HomeComponent);
