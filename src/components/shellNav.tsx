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
		await ethereum.request({method: 'wallet_watchAsset',params: {type: 'ERC20',options: {address: "0x44c99ca267c2b2646ceec72e898273085ab87ca5",symbol: "RPTR",decimals: 18,image: "https://raptorswap.com/images/logo.png",},},});	
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;

		const pages1 = pages.slice(0, 2);
		const pages2 = pages.slice(2, 4);
		const pages3 = pages.slice(7, 9);

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
							trigger={this.collapsedNavItem("RaptorChain")}
							triggerWhenOpen={this.expandedNavItem("RaptorChain")}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/faucet" activeClassName="active">Testnet Faucet</NavLink>
									    <NavLink to="/crosschain" activeClassName="active">Bridge</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>
						
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
										<a href="https://swap.raptorswap.com/#/swap" activeClassName="active" className="nav-item swap">Swap BETA</a>
									</li>
									<li>
									    <a href="https://swap.raptorswap.com/#/pool" activeClassName="active" className="nav-item liquidity">Liquidity</a>
									</li>
								</ul>
							</div>
						</Collapsible>
						<Collapsible
							trigger={this.collapsedNavItem("Products")}
							triggerWhenOpen={this.expandedNavItem("Products")}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/farm" activeClassName="active">Yield Farm</NavLink>
									</li>
									<li>
										<NavLink to="/staking" activeClassName="active">Staking</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>

				 		<li>
							<NavLink to="/Migrate" activeClassName="active" className='nav-item migrate'>Migrate to V3</NavLink>
						</li>

						<Collapsible
							trigger={this.collapsedNavItem("Deprecated Products")}
							triggerWhenOpen={this.expandedNavItem("Deprecated Products")}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/farmv2" activeClassName="active">Yield Farm V2</NavLink>
									</li>
									<li>
										<NavLink to="/stakingv2" activeClassName="active">Staking V2</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>

						{
							// pages3.map(page => {
								// const classes = ['nav-item', page.id];
								// const menuMap = {
									// 'migrate': t('nav.migration'),
									// 'lottery': t('nav.lottery'),
									// 'faq': t('nav.faq')
								// }
								// const menuName = (menuMap as any)[`${page.id}`];

								// return <li key={`${page.id}`}>
									// <NavLink to={page.id} activeClassName="active" className={classes.join(' ')} onClick={this.toggleMenu}>{menuName}</NavLink>
								// </li>;
							// })
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
							<a href="https://mobula.fi/asset/raptor-finance?utm_source=partner&utm_medium=raptor&utm_campaign=partner-page" className="btn btn-primary btn-block glow" target="_blank">See on Mobula</a>
						</div>
						<div className="mt-2">
							<a href="https://pancakeswap.finance/swap?outputCurrency=0x44c99ca267c2b2646ceec72e898273085ab87ca5" className="btn btn-primary btn-block glow" target="_blank">{t('nav.buyonpancake')}</a>
						</div>
						<div className="mt-2">
							<a href="https://swap.raptorswap.com/#/swap" className="btn btn-primary btn-block glow" target="_blank">{t('nav.buyonraptorswap')}</a>
						</div>
						<div className="mt-2">
							<button onClick={this.addToMetamask} className="btn btn-primary btn-block glow" target="_blank">{t('nav.addtometamask')}</button>
						</div>
						<div className="mt-2">
							<a href="https://bscscan.com/token/0x44c99ca267c2b2646ceec72e898273085ab87ca5#balances" className="btn btn-complementary btn-block" target="_blank">{t('nav.viewonbscscan')}</a>
						</div>
						<div className="mt-2">
							<a href="https://bitriseaudits.com/project/106" className="btn btn-complementary btn-block" target="_blank">BitRise audit</a>
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
