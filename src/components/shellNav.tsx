import * as React from 'react';

import { NavLink, useLocation } from 'react-router-dom';
import { BaseComponent, IShellPage } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages, languageCodeOnly } from '../i18n';
import Collapsible from 'react-collapsible';
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

	collapsedNavItem(title) {
		return <li className="sudo-nav-link">
			<a href="" className={`d-flex justify-content-between nav-item ${title.toLowerCase()}`}>
				<p>{title}</p>
				<p>▼</p>
			</a>
		</li>
	}

	expandedNavItem(title) {
		return <li className="sudo-nav-link">
			<a href="" className={`d-flex justify-content-between nav-item ${title.toLowerCase()}`}>
				<p>{title}</p>
				<p>▲</p>
			</a>
		</li>
	}

	checkCurrentRoute() {
		const location = window.location;

		console.log(location);

		if (location.pathname == "/launch" || location.pathname == "/lock" || location.pathname == "/swap" || location.pathname == "/liquidity") {
			return true;
		}
		return false;
	}
	
	async addToMetamask() {
		await ethereum.request({method: 'wallet_watchAsset',params: {type: 'ERC20',options: {address: "0x44c99ca267c2b2646ceec72e898273085ab87ca5",symbol: "RPTR",decimals: 18,image: "https://raptr.finance/images/logo.png",},},});	
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;

		const pages1 = pages.slice(0, 2);
		const pages2 = pages.slice(2, 7);

		return (
			<div className="navigation-wrapper">
				<div className="logo-wrapper">
					<a href="/home">
						<img src="images/updated-logo-title.svg" className="img-logo" alt="Raptor Finance" />
					</a>
					<button className="navbar-toggler" type="button" data-bs-target="#mainNav" data-bs-toggle="collapse"
						aria-controls="navbarSupportedContent" aria-label="Toggle navigation" ref={this.collapseRef}>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<nav id="mainNav">
					<ul className="navbar-nav">
						{
							pages1.map(page => {
								const classes = ['nav-item', page.id];
								const menuMap = {
									'home': t('nav.home'),
									'about': t('nav.about'),
								}
								const menuName = (menuMap as any)[`${page.id}`];

								return <li key={`${page.id}`}>
									<NavLink to={page.id} activeClassName="active" className={classes.join(' ')} onClick={this.toggleMenu}>{menuName}</NavLink>
								</li>;
							})
						}


						<Collapsible
							trigger={this.collapsedNavItem("Trade")}
							triggerWhenOpen={this.expandedNavItem("Trade")}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
										<a href="https://swap.raptr.finance/#/swap" activeClassName="active" className="nav-item swap">Swap BETA</a>
									</li>
									<li>
										<a href="https://swap.raptr.finance/#/pool" activeClassName="active" className="nav-item liquidity">Liquidity</a>
									</li>
								</ul>
							</div>
						</Collapsible>

						{
							pages2.map(page => {
								const classes = ['nav-item', page.id];
								const menuMap = {
									'farm': t('nav.farm'),
									'staking': t('nav.staking'),
									'migrate': t('nav.migration'),
									'lottery': t('nav.lottery'),
									'faq': t('nav.faq')
								}
								const menuName = (menuMap as any)[`${page.id}`];

								return <li key={`${page.id}`}>
									<NavLink to={page.id} activeClassName="active" className={classes.join(' ')} onClick={this.toggleMenu}>{menuName}</NavLink>
								</li>;
							})
						}
						{/* WIP */}
						{/* <Collapsible
							trigger={this.collapsedNavItem()}
							triggerWhenOpen={this.expandedNavItem()}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
										<NavLink to="launch" activeClassName="active" className="nav-item launch" onClick={this.toggleMenu}>Launch</NavLink>
									</li>
									<li>
										<NavLink to="lock" activeClassName="active" className="nav-item lock" onClick={this.toggleMenu}>Lock</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible> */}
					</ul>
					<div className="navigation-footer">
						<div className="mt-2">
							<a href="https://whitebit.com/trade-pro/RAPTOR_DECL?type=spot" className="btn btn-primary btn-block" target="_blank">{t('nav.buyonwhitebit')}</a>
						</div>
						<div className="mt-2">
							<a href="https://swap.raptr.finance/#/swap" className="btn btn-primary btn-block glow" target="_blank">{t('nav.buyonraptorswap')}</a>
						</div>
						<div className="mt-2">
							<button onClick={this.addToMetamask} className="btn btn-primary btn-block glow" target="_blank">{t('nav.addtometamask')}</button>
						</div>
						<div className="mt-2">
							<a href="https://bscscan.com/token/0xf9a3fda781c94942760860fc731c24301c83830a#balances" className="btn btn-complementary btn-block" target="_blank">{t('nav.viewonbscscan')}</a>
						</div>
						<select
							value={languageCodeOnly(i18n.language)}
							onChange={(e) => i18n.changeLanguage(e.target.value)}
							className="mt-2"
						>
							{supportedLanguages.map((lang) => (
								<option key={lang.code} value={lang.code}>
									{lang.name}
								</option>
							))}
						</select>
						<p className="mt-2 text-center">© {t('nav.copyright')}</p>
					</div>
				</nav>
			</div>
		)
	}
}

export default withTranslation()(ShellNav);
