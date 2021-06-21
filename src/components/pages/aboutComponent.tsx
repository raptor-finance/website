import * as React from "react";
import { withTranslation, WithTranslation, TFunction } from "react-i18next";
import { BaseComponent } from "../shellInterfaces";
import { Fade, Slide } from 'react-reveal';
import { pulse } from "react-animations";
import styled, { keyframes } from "styled-components";
import './aboutComponent.css';

export type AboutProps = {};
export type AboutState = {
	currentTab?: number,
};

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 8s ${PulseAnimation};
`;

class aboutComponent extends BaseComponent<AboutProps & WithTranslation, AboutState> {

	constructor(props) {
		super(props);
		this.state = {
			currentTab: 0,
		};
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(currentTab) {
		this.setState({ currentTab });
	}

	render() {
		const t: TFunction<"translation"> = this.readProps().t;

		const data = [
			{
				id: "1",
				name: "Q2",
				header: t('about.our_roadmap.q2_2021.title'),
				items: [
					{ text: t('about.our_roadmap.q2_2021.line1'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line2'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line3'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line4'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line5'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line6'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line7'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line8'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line9'), done: "complete", },
					{ text: t('about.our_roadmap.q2_2021.line10'), done: "complete", },
				],
			},
			{
				id: "2",
				name: "Q3",
				header: t('about.our_roadmap.q3_2021.title'),
				items: [
					{ text: t('about.our_roadmap.q3_2021.line1'), done: "wip", },
					{ text: t('about.our_roadmap.q3_2021.line2'), done: "wip", },
					{ text: t('about.our_roadmap.q3_2021.line3'), done: "wip", },
					{ text: t('about.our_roadmap.q3_2021.line4'), done: "wip", },
				],
			},
			{
				id: "3",
				name: "Q4",
				header: t('about.our_roadmap.q4_2021.title'),
				items: [
					{ text: t('about.our_roadmap.q4_2021.line1'), done: "wip", },
					{ text: t('about.our_roadmap.q4_2021.line2'), done: "wip", },
					{ text: t('about.our_roadmap.q4_2021.line3'), done: "wip", },
					{ text: t('about.our_roadmap.q4_2021.line4'), done: "wip", },
					{ text: t('about.our_roadmap.q4_2021.line5'), done: "wip", },
					{ text: t('about.our_roadmap.q4_2021.line6'), done: "wip", },
				],
			},
			{
				id: "4",
				name: "Q1",
				header: t('about.our_roadmap.q1_2022.title'),
				items: [
					{ text: t('about.our_roadmap.q1_2022.line1'), done: "wip", },
					{ text: t('about.our_roadmap.q1_2022.line2'), done: "wip", },
				],
			},
		]

		return <div className="about-container">
			<div className="d-flex flex-row container">
				<div>
					<section id="mission">
						<div className="container">
							<div className="row">
								<div className="col-md-12">
									<h1><span>{t('about.raptor_finance.title')}</span></h1>
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
									<Fade bottom>
										<h1><span>{t('about.products_overview.title')}</span></h1>
									</Fade>
									<Fade bottom>
										<h2>{t('about.products_overview.token.title')}</h2>
										<p>{t('about.products_overview.token.paragraph1')}</p>
										<p>{t('about.products_overview.token.paragraph2')}</p>
									</Fade>
									<Fade bottom>
										<h2>{t('about.products_overview.swap.title')}</h2>
										<p>{t('about.products_overview.swap.paragraph1')}</p>
										<p>{t('about.products_overview.swap.paragraph2')}</p>
									</Fade>
									<Fade bottom>
										<h2>{t('about.products_overview.staking.title')}</h2>
										<p>{t('about.products_overview.staking.paragraph1')}</p>
										<p>{t('about.products_overview.staking.paragraph2')}</p>
									</Fade>
									<Fade bottom>
										<h2>{t('about.products_overview.lottery.title')}</h2>
										<p>{t('about.products_overview.lottery.paragraph1')}</p>
										<p>{t('about.products_overview.lottery.paragraph2')}</p>
										<p>{t('about.products_overview.lottery.paragraph3')}</p>
									</Fade>
								</div>
							</div>
						</div>
					</section>
					<section id="team">
						<div className="container" id="team-members">
							<Fade bottom>
								<div id="team-header">
									<h1><span>{t('about.team.title')}</span></h1>
								</div>
								<div className="row">
									<div className="col-md-6 d-flex flex-column item">
										<img className="photo" src="images/team/ismail.png" />
										<a href="https://www.linkedin.com/in/ismail-van-essen-b6936628/" target="_blank">
											<h3 className="name">{t('about.team.founder.name')}</h3>
										</a>
										<p className="title">{t('about.team.founder.title')}</p>
										<p className="description">{t('about.team.founder.desc1')}</p>
										<p className="description">{t('about.team.founder.desc2')}</p>
										<p className="description">{t('about.team.founder.desc3')}</p>
										<p className="description">{t('about.team.founder.desc4')}</p>
										<p className="description">{t('about.team.founder.desc5')}<br /><br /></p>
									</div>
									<div className="col-md-6 d-flex flex-column item">
										<img className="photo" src="images/team/jonathan.png" />
										<a href="http://linkedin.com/in/jonathan-g-51bb35109" target="_blank">
											<h3 className="name">{t('about.team.vp_marketing.name')}</h3>
										</a>
										<p className="title">{t('about.team.vp_marketing.title')}</p>
										<p className="description">{t('about.team.vp_marketing.desc1')}</p>
										<p className="description">{t('about.team.vp_marketing.desc2')}</p>
										<p className="description">{t('about.team.vp_marketing.desc3')}</p>
										<p className="description">{t('about.team.vp_marketing.desc4')}</p>
										<p className="description">{t('about.team.vp_marketing.desc5')}<br /></p>
									</div>
								</div>
							</Fade>
							<Fade bottom>
								<div className="row">
									<div className="col-md-12 d-flex flex-column item">
										<img className="photo" src="images/team/ilija.png" />
										<a href="https://www.linkedin.com/in/ilija-icevic-246136195/" target="_blank">
											<h3 className="name">{t('about.team.vp_security.name')}</h3>
										</a>
										<p className="title">{t('about.team.vp_security.title')}</p>
									</div>
								</div>
								<div className="row">
									<div className="col-md-4 d-flex flex-column item"><img className="photo" src="images/team/rinor.png" />
										<a href="https://www.linkedin.com/in/rinor-sherifi-b568bb20b/" target="_blank">
											<h3 className="name">{t('about.team.social_media_manager.name')}</h3>
										</a>
										<p className="title">{t('about.team.social_media_manager.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item">
										<img className="photo" src="images/team/kyle.png" />
										<a href="https://www.linkedin.com/in/kyle-marcos-a52781211/" target="_blank">
											<h3 className="name">{t('about.team.content_manager.name')}</h3>
										</a>
										<p className="title">{t('about.team.content_manager.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item">
										<img className="photo" src="images/team/romain.png" />
										<a href="https://www.linkedin.com/in/romain-lambert-7a6a657a" target="_blank">
											<h3 className="name">{t('about.team.graphics_designer.name')}</h3>
										</a>
										<p className="title">{t('about.team.graphics_designer.title')}</p>
									</div>
								</div>
							</Fade>
							<Fade bottom>
								<div className="row">
									<div className="col-md-4 d-flex flex-column item"><img className="photo blank" src="images/team/blank.png" />
										<h3 className="name">{t('about.team.graphics_team_manager.name')}</h3>
										<p className="title">{t('about.team.graphics_team_manager.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item"><img className="photo blank" src="images/team/blank.png" />
										<h3 className="name">{t('about.team.software_developer1.name')}</h3>
										<p className="title">{t('about.team.software_developer1.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item"><img className="photo blank" src="images/team/blank.png" />
										<h3 className="name">{t('about.team.software_developer2.name')}</h3>
										<p className="title">{t('about.team.software_developer2.title')}</p>
									</div>
								</div>
							</Fade>
						</div>
					</section>
					<section id="roadmap">
						<div>
							<h1>{t('about.our_roadmap.title')}</h1>
							<p>{t('about.our_roadmap.paragraph')}</p>
							<div className="row" style={{ padding: "0px 20px 20px 20px" }}>
								<Fade bottom>
									<div className="tab col-md-1">
										{data.map((button, i) => (
											<React.Fragment>
												<button key={button.name} className="btn-roadmap" style={{ backgroundColor: this.state.currentTab == i ? "var(--primary)" : "var(--white)" }} onClick={() => this.handleClick(i)}>{button.name}</button>
												{i < data.length - 1 &&
													<div className="line"></div>
												}
											</React.Fragment>
										)
										)
										}
									</div>
								</Fade>
								<Fade bottom>
									<div className="roadmap-content col-md-11">
										{this.state.currentTab !== -1 &&
											<React.Fragment>
												<Fade spy={this.state}>
													<h3>{data[this.state.currentTab].header}</h3>
													<ul className="roadmap-list">
														{data[this.state.currentTab].items.map((li, i) => (
															<li className={li.done}>{li.text}</li>
														)
														)
														}
													</ul>
												</Fade>
											</React.Fragment>
										}
									</div>
								</Fade>
							</div>
						</div>
					</section>
				</div>
				<Slide right>
					<div className="d-none d-lg-flex sticky-top col-3" id="sidebar">
						<PulseDiv className="align-self-start gradient-card primary">
							<div className="background"><img src="images/logo-rp-u.svg" /></div>
							<h5><strong>{t('about.card_right.title')}</strong></h5>
							<p>{t('about.card_right.desc')}</p>
							<a className="link-dark" href="#mission">{t('about.card_right.mission')}</a>
							<a className="link-dark" href="#team">{t('about.card_right.team')}</a>
							<a className="link-dark" href="#roadmap">{t('about.card_right.roadmap')}</a>
						</PulseDiv>
					</div>
				</Slide>
			</div>
		</div>
	}
}

export default withTranslation()(aboutComponent)
