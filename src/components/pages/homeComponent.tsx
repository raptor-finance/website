import * as React from "react";
import * as numeral from "numeral";
import { BaseComponent } from "../shellInterfaces";
import './homeComponent.css';
import { DonationWalletAddress } from "../contracts/raptor";
import { RaptorStatistics } from "../contracts/statistics";
import { withTranslation, WithTranslation, TFunction, Trans } from "react-i18next";

export type HomeProps = {};
export type HomeState = {
	treeAge?: number;
	exit?: boolean;
	priceUsd?: number;
	priceBnb?: number;
	donationBalance?: number;
	treeAmount?: number;
	carbonOffset?: number;
}

class HomeComponent extends BaseComponent<HomeProps & WithTranslation, HomeState> {

	private readonly _statistics: RaptorStatistics;
	private readonly plantDate: Date = new Date("05/18/2021");

	private _timeout = null;

	constructor(props: HomeProps & WithTranslation) {
		super(props);
		this.state = {};
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

		const timeDelta = new Date().getTime() - this.plantDate.getTime();
		const dayDelta = Math.floor(timeDelta / (1000 * 3600 * 24));

		await this._statistics.refresh();

		this.setState({
			treeAge: dayDelta,
			donationBalance: this._statistics.donationWalletBalance,
			priceBnb: this._statistics.raptorBnbPrice,
			priceUsd: this._statistics.raptorUsdPrice
		});

		fetch("https://public.ecologi.com/users/raptorfinance/impact")
			.then(res => res.json())
			.then(
				(result) => {
					this.setState({
						treeAmount: result.trees,
						carbonOffset: result.carbonOffset
					});
				},
				(err) => {
					console.error("Error fetching data from ecologi API", err);
				}
			)

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

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		return <div className="home-container">
			<div className="container" style={{ marginTop: "6%" }}>
				<div className="row">
					<div className="col-md-6">
						<h1><strong className="title-white">{t('home.subtitle1')}</strong><br /></h1>
						<p>{t('home.paragraph1')}</p>
					</div>
					<div className="col-md-6 d-flex">
						<div className="shadow d-flex flex-row align-self-center flex-wrap gradient-card primary"
							id="raptor-forest">
							<h4 className="flex-fill">{t('home.raptor_forest.title')}</h4>
							<p><Trans i18nKey='home.raptor_forest.funder'><strong>Funded by: </strong><span>Raptor Finance</span></Trans></p>
							<p><strong>{t('home.raptor_forest.age')} </strong><span>{t('home.raptor_forest.day', { count: this.readState().treeAge })}</span></p>
							<p><strong>{t('home.raptor_forest.co2_offset')} </strong><span>{this.readState().carbonOffset} {t('home.raptor_forest.tonnes')}</span></p>
							<p><strong>{t('home.raptor_forest.species')} </strong><span>8</span></p>
							<p><strong>{t('home.raptor_forest.tree_amount')} </strong><span>{this.readState().treeAmount}</span></p>
							<p><strong>{t('home.raptor_forest.planting_projects')} </strong><span>2</span></p>
							<p><strong>{t('home.raptor_forest.our_forest')} 🌳:</strong> <span><a className="title-white" href="https://ecologi.com/raptorfinance">{t('home.raptor_forest.click_here')}</a></span></p>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6">
						<div className="d-flex justify-content-center flex-sm-column flex-lg-row hero-buttons"><a
							className="shadow btn btn-primary btn-lg" role="button" href="about" style={{ marginLeft: "0" }}>{t('home.about_us')}</a><a
								className="shadow btn btn-light btn-lg" role="button" href="/whitepaper.pdf" target="_blank">{t('home.our_docs')}</a>
						</div>
					</div>
					<div className="col-md-6">
						<div className="d-flex justify-content-center flex-sm-column flex-lg-row hero-buttons">
							<a
								className="shadow btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image"
								href="lottery" role="button">
								<img src="images/lottery.svg" />
								<span className="text-light"><Trans i18nKey='home.win_tokens'><strong>Win </strong>Raptor tokens</Trans></span>
							</a>
							<a
								className="shadow btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image"
								href="staking" role="button">
								<img src="images/staking.svg" />
								<span className="text-light"><Trans i18nKey='home.earn_tokens'><strong>Earn </strong>Raptor tokens</Trans></span>
							</a>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6">
					<h1><strong className="title-white">{t('home.subtitle2')}</strong><br /></h1>
					<p>{t('home.paragraph2')} <a href="about#roadmap">{t('home.roadmap')}</a> {t('home.for_details')}</p>
					<p>{t('home.paragraph3')} <a href={`https://bscscan.com/address/${DonationWalletAddress}`} target="_blank" style={{ fontFamily: 'monospace', wordBreak: "break-word" }}>{DonationWalletAddress}</a></p>
					<p>{t('home.paragraph4_1')}{numeral(state.donationBalance).format('0,0.00')}{t('home.paragraph4_2')}</p>
				</div>
				<div className="col-md-6 d-flex">
					<div className="shadow d-flex flex-row align-self-center flex-wrap gradient-card primary"
						id="raptor-forest">
						<h4 className="flex-fill">{t('home.token_statistics.title')}</h4>
							{/* <p><strong>Price in USD: </strong><span>{(+state.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 12, minimumFractionDigits: 12})}</span></p> */}
							<p><strong>{t('home.token_statistics.price_usd')} </strong><span>{this.convert(+state.priceUsd).toString()}</span></p>
							<p><strong>{t('home.token_statistics.price_bnb')} </strong><span>{this.convert(+state.priceBnb).toString()}</span></p>
						</div>
					</div>
				</div>
			</div >
		</div >
	}
}

export default withTranslation()(HomeComponent)
