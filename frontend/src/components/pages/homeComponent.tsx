import * as React from "react";
import {BaseComponent} from "../shellInterfaces";
import {Link} from "react-router-dom";

export type HomeProps = {};
export type HomeState = {
	treeAge?: number;
	exit?: boolean;
}

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
			<div className="row align-items-center">
				<div className="col-12 col-lg-7 mb-4 mb-lg-0">
					<h1 className="text-white font-weight-bold">
						<div>Can we heal the Earth together?</div>
					</h1>
					<div>
						<p className="text-white">
							Raptor Finance is a decentralized, financial ecosystem designed by holders for holders. Our mission is to heal planet Earth together and fight climate change! We achieve this by donating to community-chosen projects that help prevent climate change. There is no planet B, therefore we need to work together to help save Mother Earth!
						</p>
					</div>
					<div>

						<div className="row">
							<div className="col-6">
								<Link to="about" className="btn btn-outline-light btn-block">About Raptor</Link>
							</div>
							<div className="col-6">
								<a href="/whitepaper.pdf" className="btn btn-light btn-block"
								   target="_blank">Whitepaper</a>
							</div>
						</div>
					</div>
				</div>
				<div className="col-12 col-lg-5">
					<div className="row">
						<div className="col-12 col-md-6 col-lg-6 mb-3 mb-lg-auto">
							<Link to="staking">
								<div className="card card-dark card-rounded-x2">
									<div className="card-body text-center">
										<img src="images/staking.svg" width="120" height="60" />
										<div className="mt-2 small">
											Earn More Raptors
										</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="col-12 col-md-6 col-lg-6">
							<Link to="lottery">
								<div className="card card-dark card-rounded-x2">
									<div className="card-body text-center">
										<img src="images/lottery.svg" width="120" height="60" />
										<div className="mt-2 small">
											Win More Raptors
										</div>
									</div>
								</div>
							</Link>
						</div>
					</div>
					<div className="row">
						<div className="col">
							<div className="card card-rounded-x2  overflow-hidden mt-1 gradient-green-blue mb-5">
								<div className=" planet-earth-image"/>
								<div className="card-body text-left">
									<div className="row p-4">
										<div className="col-12">
											<h2 className="text-dark font-weight-bold mb-5 mt-5">Raptor Forest</h2>
										</div>

										<div className="col-12 col-lg-6">
											<div className="text-dark pb-2">
												<h5><strong>Funded by:</strong><span className="font-weight-thin"> Raptor Finance </span>
												</h5>
											</div>
											<div className="text-dark pb-2">
												<h5><strong>CO2 Offset:</strong> 3 tonnes</h5>
											</div>
											<div className="text-dark">
												<h5><strong>Projects:</strong> 2</h5>
											</div>
										</div>

										<div className="col-12 col-lg-6">
											<div className="text-dark pb-2">
												<h5><strong>Age:</strong> <span id="dayCounter">{this.readState().treeAge}</span></h5>
											</div>
											<div className="text-dark pb-2">
												<h5><strong>Species:</strong> 6</h5>
											</div>
											<div className="text-dark">
												<h5><strong>Trees:</strong> 151</h5>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	}

}
