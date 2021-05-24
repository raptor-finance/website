import * as React from 'react';
import {BaseComponent, IShellPage, ShellNavigator} from "./shellInterfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './shellNav.css';
import './shellNav.icons.css';
import {faBars} from "@fortawesome/free-solid-svg-icons";

export type ShellNavProps = {
	pages: IShellPage[];
	navigator: ShellNavigator;
};
export type ShellNavState = {
	currentPage?: IShellPage;
};

export class ShellNav extends BaseComponent<ShellNavProps, ShellNavState> {

	constructor(props: ShellNavProps) {
		super(props);
	}

	get currentPage(): IShellPage {
		return (this.readState() || {}).currentPage;
	}

	set currentPage(value: IShellPage) {
		this.readProps().navigator.navigateTo(value);
		this.updateState({currentPage: value});
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		return (
			<div className="navigation-wrapper">
				<div className="logo-wrapper">
					<img src="images/logo.svg" className="img-logo" alt="Raptor Finance"/>
					<button className="navbar-toggler" type="button" data-bs-target="#navbarResponsive" data-bs-toggle="collapse"
							aria-controls="navbarSupportedContent" aria-expanded={false} aria-label="Toggle navigation">
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<nav id="mainNav">
					<ul className="navbar-nav">
						{
							pages.map(page => {
								const classes = ['nav-item', page.id];
								if (page == this.currentPage) {
									classes.push('active');
								}
								return <li key={`${page.id}`}>
									<a href={'#' + page.id} className={classes.join(' ')} onClick={() => this.currentPage = page}>{page.title}</a>
								</li>;
							})
						}
					</ul>
					<div className="navigation-footer">
						<div className="text-center text-lg-left mb-2">
							<a href="https://twitter.com/raptor_token" className="btn-social">
								<span className="iconify" data-icon="jam:twitter-circle" data-inline="false"></span>
							</a>
							<a href="https://t.me/PhilosoRaptorToken" className="btn-social">
								<span className="iconify" data-icon="ri:telegram-line" data-inline="false"></span>
							</a>
						</div>
						<div>
							<a href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xf9A3FdA781c94942760860fc731c24301c83830A"
							   className="btn btn-success btn-block">Buy on PancakeSwap</a>
						</div>
						<div className="mt-3">
							<a href="https://bscscan.com/token/0xf9a3fda781c94942760860fc731c24301c83830a#balances"
							   className="btn btn-light btn-block">View on BSCscan</a>
						</div>
					</div>
				</nav>
			</div>
		)
	}
}
