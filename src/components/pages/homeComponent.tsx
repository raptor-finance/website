import * as React from 'react';

import { Suspense } from 'react';
import { BaseComponent } from '../shellInterfaces';
import { DonationWalletAddress } from '../contracts/raptor';
import { RaptorStatistics } from '../contracts/statistics';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { Slide } from 'react-reveal';
import { pulse } from 'react-animations';
import { PuffLoader, PropagateLoader } from 'react-spinners';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';

import './homeComponent.css';

export type HomeProps = {};
export type HomeState = {
	exit?: boolean;
	donationBalance?: number;
};

const RoadmapDiv = React.lazy(() => import('../roadmap'));
const RaptorForestDiv = React.lazy(() => import('../raptorForest'));
const TokenStatisticsDiv = React.lazy(() => import('../tokenStatistics'));

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 5s ${PulseAnimation};
`;

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

		return <div className="home-container">
			<div className="container" style={{ marginTop: "6%" }}>
				<div className="row">
					<div className="col-md-6">
						<h1><strong className="title-white">{t('home.subtitle1')}</strong><br /></h1>
						<p>{t('home.paragraph1')}</p>
						<p>{t('home.paragraph1_end')}</p>
						<div className="d-flex flex-sm-column flex-lg-row hero-buttons">
							<Slide left>
								<a className="shadow btn btn-primary btn-lg btn-about" role="button" href="about" style={{ marginLeft: "0" }}>{t('home.about_us')}</a>
								<a className="shadow btn btn-complementary btn-lg" role="button" href="/whitepaper.pdf" target="_blank">{t('home.our_docs')}</a>
							</Slide>
						</div>
						<h1><strong className="title-white">{t('home.subtitle2')}</strong><br /></h1>
						<p>{t('home.paragraph2')} <a href="about#roadmap">{t('home.roadmap')}</a> {t('home.for_details')}</p>
						<p>{t('home.paragraph3')} <a href={`https://bscscan.com/address/${DonationWalletAddress}`} target="_blank" style={{ fontFamily: 'monospace', wordBreak: "break-word" }}>{DonationWalletAddress}</a></p>
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
					<div className="col-md-6">
						<Suspense fallback={<PuffLoader color={'#ffffff'} />}>
							<RaptorForestDiv />
						</Suspense>
						<div className="d-flex justify-content-around flex-sm-column flex-lg-row hero-buttons">
							<Slide right>
								<PulseDiv>
									<a
										className="shadow btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image btn-features"
										href="lottery" role="button">
										<img src="images/lottery.svg" alt="raptor-lottery-logo" />
										<span className="text-light"><Trans i18nKey='home.win_tokens'><strong>Win </strong>Raptor tokens</Trans></span>
									</a>
								</PulseDiv>
								<PulseDiv>
									<a
										className="shadow btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image btn-features"
										href="staking" role="button">
										<img src="images/staking.svg" alt="raptor-staking-logo" />
										<span className="text-light"><Trans i18nKey='home.earn_tokens'><strong>Earn </strong>Raptor tokens</Trans></span>
									</a>
								</PulseDiv>
							</Slide>
						</div>
						<Suspense fallback={<PuffLoader color={'#ffffff'} />}>
							<TokenStatisticsDiv />
						</Suspense>
					</div>
				</div>
				<section>
					<Suspense fallback={<PropagateLoader color={'#ffffff'} />}>
						<RoadmapDiv />
					</Suspense>
				</section>
			</div>
		</div >
	}
}

export default withTranslation()(HomeComponent);
