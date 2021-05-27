import * as React from "react";
import {BaseComponent} from "../shellInterfaces";
import {Link} from "react-router-dom";

export type HomeProps = {};
export type HomeState = {
	treeAge?: number;
	exit?: boolean;
}

import './homeComponent.css';

export class HomeComponent extends BaseComponent<HomeProps, HomeState> {

	private readonly plantDate: Date = new Date("05/18/2021");

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		console.log('mount');
		this.tick();
	}

	componentWillUnmount() {
		this.setState({exit: true});
	}

	tick() {
		const self = this;
		const state = this.readState();

		if (state.exit) {
			return;
		}

		const timeDelta = new Date().getTime() - this.plantDate.getTime();
		const dayDelta = Math.floor(timeDelta / (1000 * 3600 * 24));

		this.setState({treeAge: dayDelta})
		setTimeout(() => self.tick.call(self), 60000);
	}

	render() {
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
							<h4 className="flex-fill">Our Raptor forest</h4>
							<p><strong>Funded by: </strong><span>Raptor Finance</span></p>
							<p><strong>Age: </strong><span>{this.readState().treeAge} days</span></p>
							<p><strong>CO2 offset: </strong><span>3 tonnes</span></p>
							<p><strong>Different species: </strong><span>6</span></p>
							<p><strong>Amount of trees: </strong><span>151</span></p>
							<p><strong>Planting projects: </strong><span>2</span></p>
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
			</div>
		</div>
	}
}
