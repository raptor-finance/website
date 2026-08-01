import * as React from 'react';

import { NavLink } from 'react-router-dom';
import { BaseComponent, IShellPage } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages, languageCodeOnly } from '../i18n';
import Collapsible from 'react-collapsible';
import { RPTR_TOKEN, CHAIN } from '../config';
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

	navItem(title, open: boolean) {
		return <li className="sudo-nav-link">
			<a href="" className={`d-flex justify-content-between nav-item ${title.toLowerCase()}`}>
				<p>{title}</p>
				<p>{open ? '▲' : '▼'}</p>
			</a>
		</li>
	}

	/** Whether any of the collapsible sections should be force-opened. */
	checkCurrentRoute() {
		const { pathname } = window.location;
		return ["/launch", "/lock", "/swap", "/liquidity"].includes(pathname);
	}
	
	async addToMetamask() {
		const provider: any = (window as any).ethereum;
		if (!provider || !provider.request) {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}
		await provider.request({
			method: 'wallet_watchAsset',
			params: {
				type: 'ERC20',
				options: {
					address: RPTR_TOKEN[CHAIN.BSC],
					symbol: "RPTR",
					decimals: 18,
					image: "https://raptorswap.com/images/logo.png",
				},
			},
		});
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;

		const pages1 = pages.slice(0, 2);

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
							trigger={this.navItem("Mainnet", false)}
							triggerWhenOpen={this.navItem("Mainnet", true)}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/bridge" activeClassName="active">Bridge</NavLink>
									    <NavLink to="/yourtoken" activeClassName="active">Your token</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>

						<Collapsible
							trigger={this.navItem("RaptorSwap", false)}
							triggerWhenOpen={this.navItem("RaptorSwap", true)}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/swap" activeClassName="active">Swap</NavLink>
									</li>
									<li>
										<NavLink to="/liquidity" activeClassName="active">Liquidity</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>
						
						<Collapsible
							trigger={this.navItem("Earn", false)}
							triggerWhenOpen={this.navItem("Earn", true)}
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
							<NavLink to="/lottery" activeClassName="active" className='nav-item lottery'>Lottery</NavLink>
						</li>
						<Collapsible
							trigger={this.navItem("Testnet", false)}
							triggerWhenOpen={this.navItem("Testnet", true)}
							transitionTime={240}
							transitionCloseTime={240}
							open={this.checkCurrentRoute()}
						>
							<div className="collapsible-div">
								<ul className="navbar-nav">
									<li>
									    <NavLink to="/faucet" activeClassName="active">Faucet</NavLink>
									    <NavLink to="/crosschain" activeClassName="active">Bridge</NavLink>
									</li>
								</ul>
							</div>
						</Collapsible>

				 		<li>
							<NavLink to="/migrate" activeClassName="active" className='nav-item migrate'>Migrate to V3</NavLink>
						</li>

						<Collapsible
							trigger={this.navItem("Deprecated Products", false)}
							triggerWhenOpen={this.navItem("Deprecated Products", true)}
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
									<li>
										<a href="https://swap.raptorswap.com/#/swap" className="nav-item swap">BSC Swap BETA</a>
									</li>
									<li>
									    <a href="https://swap.raptorswap.com/#/pool" className="nav-item liquidity">BSC Liquidity</a>
									</li>
								</ul>
							</div>
						</Collapsible>
					</ul>
					<div className="navigation-footer">
						<div className="mt-2">
							<a href="https://mobula.fi/asset/raptor-finance?utm_source=partner&utm_medium=raptor&utm_campaign=partner-page" className="btn btn-primary btn-block glow" target="_blank">See on Mobula</a>
						</div>
						<div className="mt-2">
							<a href={`https://pancakeswap.finance/swap?outputCurrency=${RPTR_TOKEN[CHAIN.BSC]}`} className="btn btn-primary btn-block glow" target="_blank">{t('nav.buyonpancake')}</a>
						</div>
						<div className="mt-2">
							<a href="https://swap.raptorswap.com/#/swap" className="btn btn-primary btn-block glow" target="_blank">{t('nav.buyonraptorswap')}</a>
						</div>
						<div className="mt-2">
							<button onClick={this.addToMetamask} className="btn btn-primary btn-block glow" target="_blank">{t('nav.addtometamask')}</button>
						</div>
						<div className="mt-2">
							<a href={`https://bscscan.com/token/${RPTR_TOKEN[CHAIN.BSC]}#balances`} className="btn btn-complementary btn-block" target="_blank">{t('nav.viewonbscscan')}</a>
						</div>
						<div className="mt-2">
							<a href="https://bitgert.com/audits/public/project/106" className="btn btn-complementary btn-block" target="_blank">BitRise audit</a>
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
