import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';
import { Fade, Slide } from 'react-reveal';
import { pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';

import './aboutComponent.css';

export type AboutProps = {};
export type AboutState = {};

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 8s ${PulseAnimation};
`;

class aboutComponent extends BaseComponent<AboutProps & WithTranslation, AboutState> {

	constructor(props) {
		super(props);
	}

	render() {
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="about-container">
			<div className="d-flex flex-row container" style={{ padding: "0px" }}>
				<div>
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
									<Fade bottom>
										<h1><strong>{t('about.products_overview.title')}</strong></h1>
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
									<h1><strong>{t('about.team.title')}</strong></h1>
								</div>
								<div className="row">
									<div className="col-md-6 d-flex flex-column item">
										<img className="photo" src="images/team/ismail.png" alt="raptor-team-founder" />
										<a href="https://www.linkedin.com/in/ismail-van-essen-b6936628/" target="_blank">
											<h2 className="name">{t('about.team.founder.name')}</h2>
										</a>
										<p className="title">{t('about.team.founder.title')}</p>
										<p className="description">{t('about.team.founder.desc1')}</p>
										<p className="description">{t('about.team.founder.desc2')}</p>
										<p className="description">{t('about.team.founder.desc3')}</p>
										<p className="description">{t('about.team.founder.desc4')}</p>
										<p className="description">{t('about.team.founder.desc5')}<br /><br /></p>
									</div>
									<div className="col-md-6 d-flex flex-column item">
										<img className="photo" src="images/team/jonathan.png" alt="raptor-team-vp-marketing" />
										<a href="http://linkedin.com/in/jonathan-g-51bb35109" target="_blank">
											<h2 className="name">{t('about.team.vp_marketing.name')}</h2>
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
										<img className="photo" src="images/team/ilija.png" alt="raptor-team-vp-security" />
										<a href="https://www.linkedin.com/in/ilija-icevic-246136195/" target="_blank">
											<h2 className="name">{t('about.team.vp_security.name')}</h2>
										</a>
										<p className="title">{t('about.team.vp_security.title')}</p>
									</div>
								</div>
							</Fade>
							<Fade left>
								<div className="row">
									<div className="col-md-4 d-flex flex-column item"><img className="photo" src="images/team/rinor.png" alt="raptor-team-social-media-manager" />
										<a href="https://www.linkedin.com/in/rinor-sherifi-b568bb20b/" target="_blank">
											<h2 className="name">{t('about.team.social_media_manager.name')}</h2>
										</a>
										<p className="title">{t('about.team.social_media_manager.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item">
										<img className="photo" src="images/team/kyle.png" alt="raptor-team-content-manager" />
										<a href="https://www.linkedin.com/in/kyle-marcos-a52781211/" target="_blank">
											<h2 className="name">{t('about.team.content_manager.name')}</h2>
										</a>
										<p className="title">{t('about.team.content_manager.title')}</p>
									</div>
									<div className="col-md-4 d-flex flex-column item">
										<img className="photo" src="images/team/romain.png" alt="raptor-team-graphics-designer" />
										<a href="https://www.linkedin.com/in/romain-lambert-7a6a657a" target="_blank">
											<h2 className="name">{t('about.team.graphics_designer.name')}</h2>
										</a>
										<p className="title">{t('about.team.graphics_designer.title')}</p>
									</div>
								</div>
							</Fade>
							<Fade right>
								<div className="row">
									<div className="col-md-6 d-flex flex-column item"><img className="photo blank" src="images/team/blank.png" alt="raptor-team-blank" />
										<h2 className="name">{t('about.team.software_developer1.name')}</h2>
										<p className="title">{t('about.team.software_developer1.title')}</p>
									</div>
									<div className="col-md-6 d-flex flex-column item"><img className="photo blank" src="images/team/blank.png" alt="raptor-team-blank" />
										<h2 className="name">{t('about.team.software_developer2.name')}</h2>
										<p className="title">{t('about.team.software_developer2.title')}</p>
									</div>
								</div>
							</Fade>
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
							<a className="link-dark" href="#team">{t('about.card_right.team')}</a>
						</PulseDiv>
					</div>
				</Slide>
			</div>
		</div>
	}
}

export default withTranslation()(aboutComponent);
