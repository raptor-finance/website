import * as React from 'react';

import { withTranslation, useTranslation } from 'react-i18next';
import { Fade } from 'react-reveal';

const Team: React.FC = ({ }) => {
	const { t } = useTranslation();

	return (
		<div className="container" id="team-members">
			<Fade bottom>
				<div id="team-header">
					<h1><strong>{t('about.team.title')}</strong></h1>
				</div>
				<div className="row">
					<div className="col-md-6 d-flex flex-column item">
						<img className="photo" src="images/team/ismail.png" alt="raptor-team-founder" />
						<a href="https://www.linkedin.com/in/ismail-van-essen-b6936628/" rel="noreferrer" target="_blank">
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
						<a href="http://linkedin.com/in/jonathan-g-51bb35109" rel="noreferrer" target="_blank">
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
						<a href="https://www.linkedin.com/in/ilija-icevic-246136195/" rel="noreferrer" target="_blank">
							<h2 className="name">{t('about.team.vp_security.name')}</h2>
						</a>
						<p className="title">{t('about.team.vp_security.title')}</p>
					</div>
				</div>
			</Fade>
			<Fade left>
				<div className="row">
					<div className="col-md-4 d-flex flex-column item"><img className="photo" src="images/team/rinor.png" alt="raptor-team-social-media-manager" />
						<a href="https://www.linkedin.com/in/rinor-sherifi-b568bb20b/" rel="noreferrer" target="_blank">
							<h2 className="name">{t('about.team.social_media_manager.name')}</h2>
						</a>
						<p className="title">{t('about.team.social_media_manager.title')}</p>
					</div>
					<div className="col-md-4 d-flex flex-column item">
						<img className="photo" src="images/team/kyle.png" alt="raptor-team-content-manager" />
						<a href="https://www.linkedin.com/in/kyle-marcos-a52781211/" rel="noreferrer" target="_blank">
							<h2 className="name">{t('about.team.content_manager.name')}</h2>
						</a>
						<p className="title">{t('about.team.content_manager.title')}</p>
					</div>
					<div className="col-md-4 d-flex flex-column item">
						<img className="photo" src="images/team/romain.png" alt="raptor-team-graphics-designer" />
						<a href="https://www.linkedin.com/in/romain-lambert-7a6a657a" rel="noreferrer" target="_blank">
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
	)
};

export default withTranslation()(Team);