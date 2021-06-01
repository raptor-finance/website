import * as React from "react";
import * as numeral from "numeral";
import {BaseComponent} from "../shellInterfaces";

export type HomeProps = {};
export type HomeState = {
	treeAge?: number;
	exit?: boolean;
	priceUsd?: number;
	priceBnb?: number;
	donationBalance?: number;
}

import './homeComponent.css';
import {DonationWalletAddress} from "../contracts/raptor";
import {RaptorStatistics} from "../contracts/statistics";

export class HomeComponent extends BaseComponent<HomeProps, HomeState> {

	private readonly _statistics: RaptorStatistics;
	private readonly plantDate: Date = new Date("05/18/2021");

	private _timeout = null;

	constructor(props) {
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

		this.setState({exit: true});
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

		this._timeout = setTimeout(async () => await self.tick.call(self), 60000);
	}

	render() {
		const state = this.readState();

		return <div className="home-container">
			<div className="container" style={{marginTop: "10%"}}>
				<div className="row">
					<div className="col-md-6">
						<h1><strong className="title-white">Can we heal the Earth together?</strong><br/></h1>
						<p>Raptor Finance is a decentralized, financial ecosystem designed by holders for holders. Our
							mission is to heal planet Earth together and fight climate change! We achieve this by
							donating to community-chosen projects that help prevent climate change. There is no planet
							B, therefore we need to work together to help save Mother Earth!
						</p>
					</div>
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-row align-self-center flex-wrap gradient-card primary"
							 id="raptor-forest">
							<h4 className="flex-fill">Our Raptor Forest</h4>
							<p><strong>Funded by: </strong><span>Raptor Finance</span></p>
							<p><strong>Age: </strong><span>{this.readState().treeAge} days</span></p>
							<p><strong>CO2 offset: </strong><span>22.24 tonnes</span></p>
							<p><strong>Different species: </strong><span>8</span></p>
							<p><strong>Amount of trees: </strong><span>1,887</span></p>
							<p><strong>Planting projects: </strong><span>2</span></p>
							<p><strong>Our Forest:</strong> <span><a className="title-white" href="https://ecologi.com/raptorfinance">Click Here</a></span></p>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6">
						<div className="d-flex justify-content-center flex-sm-column flex-lg-row hero-buttons"><a
							className="btn btn-primary btn-lg" role="button" href="about">About Us</a><a
							className="btn btn-light btn-lg" role="button" href="/whitepaper.pdf" target="_blank">Our Docs</a>
						</div>
					</div>
					<div className="col-md-6">
						<div className="d-flex justify-content-center flex-sm-column flex-lg-row hero-buttons">
							<a
								className="btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image"
								href="lottery" role="button">
									<img src="images/lottery.svg"/>
									<span className="text-light"><strong>Win </strong>Raptor tokens</span>
							</a>
							<a
								className="btn btn-dark btn-lg d-flex flex-column align-items-center large-button-image"
								href="staking" role="button">
									<img src="images/staking.svg"/>
									<span className="text-light"><strong>Earn </strong>Raptor tokens</span>
							</a>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6">
						<h1><strong className="title-white">Want to help?</strong><br/></h1>
						<p>You can help us saving the earth by donating to the official Raptor community donation wallet. The balance of this wallet will be gradually donated to environmental charities starting Q4/2021. Please check our <a href="about#roadmap">roadmap</a> for details.</p>
						<p>This is our only donation wallet address: <a href={`https://bscscan.com/address/${DonationWalletAddress}`} target="_blank" style={{fontFamily: 'monospace'}}>{DonationWalletAddress}</a></p>
						<p>There is currently ${numeral(state.donationBalance).format('0,0.00')} in our wallet to be donated!</p>
					</div>
					<div className="col-md-6 d-flex">
						<div className="d-flex flex-row align-self-center flex-wrap gradient-card primary"
							 id="raptor-forest">
							<h4 className="flex-fill">Token statistics</h4>
							<p><strong>Price in USD: </strong><span>{(+state.priceUsd).toLocaleString('en-US', {maximumFractionDigits: 12, minimumFractionDigits: 12})}</span></p>
							<p><strong>Price in BNB: </strong><span>{(+state.priceBnb).toLocaleString('en-US', {maximumFractionDigits: 12, minimumFractionDigits: 12})}</span></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}
