import * as React from 'react';

import { NavLink } from 'react-router-dom';
import { BaseComponent, IShellPage } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faMedium, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faReddit } from '@fortawesome/free-brands-svg-icons/faReddit';
import { faTiktok } from '@fortawesome/free-brands-svg-icons/faTiktok';
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube';
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages, languageCodeOnly } from '../i18n';
import './shellNav.css';
import './shellNav.icons.css';

export type ShellNavProps = {
	pages: IShellPage[];
};
export type ShellNavState = {
	currentPage?: IShellPage;
};

class ShellNav extends BaseComponent<ShellNavProps & WithTranslation, ShellNavState> {

	private collapseRef = React.createRef<HTMLButtonElement>();
	constructor(props: ShellNavProps & WithTranslation) {
		super(props);
	}

	toggleMenu = (e) => {
		if (window.innerWidth < 990)
			this.collapseRef.current.click();
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;
		return (
			<div className="navigation-wrapper">
				<div className="logo-wrapper">
					<a href="/home">
						<img src="images/logo.svg" className="img-logo" alt="Raptor Finance" />
					</a>
					<button className="navbar-toggler" type="button" data-bs-target="#mainNav" data-bs-toggle="collapse"
						aria-controls="navbarSupportedContent" aria-label="Toggle navigation" ref={this.collapseRef}>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<nav id="mainNav">
					<ul className="navbar-nav">
						{
							pages.map(page => {
								const classes = ['nav-item', page.id];
								const menuMap = {
									'home': t('nav.home'),
									'about': t('nav.about'),
									'staking': t('nav.staking'),
									'lottery': t('nav.lottery'),
									'faq': t('nav.faq')
								}
								const menuName = (menuMap as any)[`${page.id}`];
								return <li key={`${page.id}`}>
									<NavLink to={page.id} activeClassName="active" className={classes.join(' ')} onClick={this.toggleMenu}>{menuName}</NavLink>
								</li>;
								// return <li key={`${page.id}`}>
								// 	<NavLink  to={page.id} activeClassName="active" className={classes.join(' ')} onClick={this.toggleMenu}>{page.title}</NavLink>									
								// </li>;
							})
						}
					</ul>
					<div className="navigation-footer">
						<div className="social-medias text-center text-lg-left">
							<a href="https://twitter.com/raptor_token" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTwitter} />
							</a>
							<a href="https://t.me/PhilosoRaptorToken" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTelegram} />
							</a>
							<a href="https://www.facebook.com/raptr.finance" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faFacebook} />
							</a>
							<a href="https://www.instagram.com/raptor_token/" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							<a href="https://www.reddit.com/r/RaptorToken/" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faReddit} />
							</a>
							<a href="https://www.tiktok.com/@raptor.finance" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTiktok} />
							</a>
							<a href="https://www.youtube.com/channel/UCQ-yByM7ECDvB1CIr_5Pafg" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faYoutube} />
							</a>
							<a href="https://discord.gg/EJwR3pjd9A" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faDiscord} />
							</a>
							<a href="https://raptor-finance.medium.com/" rel="noreferrer" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faMedium} />
							</a>
						</div>
						<div>
							<a href="https://whitebit.com/trade-pro/RAPTOR_DECL?type=spot" className="btn btn-primary btn-block" target="_blank">{t('nav.buyonwhitebit')}</a>
						</div>
						<div className="mt-3">
							<a href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xf9A3FdA781c94942760860fc731c24301c83830A" className="btn btn-primary btn-block" target="_blank">{t('nav.buyonpancakeswap')}</a>
						</div>
						<div className="mt-3">
							<a href="https://bscscan.com/token/0xf9a3fda781c94942760860fc731c24301c83830a#balances" className="btn btn-complementary btn-block" target="_blank">{t('nav.viewonbscscan')}</a>
						</div>
						<select
							value={languageCodeOnly(i18n.language)}
							onChange={(e) => i18n.changeLanguage(e.target.value)}
							className="lang-select"
						>
							{supportedLanguages.map((lang) => (
								<option key={lang.code} value={lang.code}>
									{lang.name}
								</option>
							))}
						</select>
						<p className="mt-3 text-center">© {t('nav.copyright')}</p>
					</div>
				</nav>
			</div>
		)
	}
}

export default withTranslation()(ShellNav);
