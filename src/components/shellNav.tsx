import * as React from 'react';
import { NavLink  } from "react-router-dom";
import {BaseComponent, IShellPage} from "./shellInterfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './shellNav.css';
import './shellNav.icons.css';
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {faTelegram, faTwitter} from "@fortawesome/free-brands-svg-icons";
import {faFacebook} from "@fortawesome/free-brands-svg-icons/faFacebook";
import {faInstagram} from "@fortawesome/free-brands-svg-icons/faInstagram";
import {faReddit} from "@fortawesome/free-brands-svg-icons/faReddit";
import {faTiktok} from "@fortawesome/free-brands-svg-icons/faTiktok";
import {faYoutube} from "@fortawesome/free-brands-svg-icons/faYoutube";
import {faDiscord} from "@fortawesome/free-brands-svg-icons/faDiscord";

export type ShellNavProps = {
	pages: IShellPage[];
};
export type ShellNavState = {
	currentPage?: IShellPage;
};

export class ShellNav extends BaseComponent<ShellNavProps, ShellNavState> {

	constructor(props: ShellNavProps) {
		super(props);
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		return (
			<div className="navigation-wrapper">
				<div className="logo-wrapper">
					<a href="/home">
						<img src="images/logo.svg" className="img-logo" alt="Raptor Finance"/>
					</a>
					<button className="navbar-toggler" type="button" data-bs-target="#mainNav" data-bs-toggle="collapse"
							aria-controls="navbarSupportedContent" aria-label="Toggle navigation">
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<nav id="mainNav">
					<ul className="navbar-nav">
						{
							pages.map(page => {
								const classes = ['nav-item', page.id];
								return <li key={`${page.id}`}>
									<NavLink  to={page.id} activeClassName="active" className={classes.join(' ')}>{page.title}</NavLink>
								</li>;
							})
						}
					</ul>
					<div className="navigation-footer">
						<div className="text-center text-lg-left mb-2">
							<a href="https://twitter.com/raptor_token" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTwitter} />
							</a>
							<a href="https://t.me/PhilosoRaptorToken" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTelegram} />
							</a>
							<a href="https://www.facebook.com/raptr.finance" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faFacebook} />
							</a>
							<a href="https://www.instagram.com/raptor_token/" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							<a href="https://www.reddit.com/r/RaptorToken/" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faReddit} />
							</a>
							<a href="https://www.tiktok.com/@raptor.finance" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faTiktok} />
							</a>
							<a href="https://www.youtube.com/channel/UCQ-yByM7ECDvB1CIr_5Pafg" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faYoutube} />
							</a>
							<a href="https://discord.gg/EJwR3pjd9A" className="btn-social" target="_blank">
								<FontAwesomeIcon icon={faDiscord} />
							</a>
						</div>
						<div>
							<a href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xf9A3FdA781c94942760860fc731c24301c83830A" className="btn btn-success btn-block" target="_blank">Buy on PancakeSwap</a>
						</div>
						<div className="mt-3">
							<a href="https://bscscan.com/token/0xf9a3fda781c94942760860fc731c24301c83830a#balances" className="btn btn-light btn-block" target="_blank">View on BSCscan</a>
						</div>
					</div>
				</nav>
			</div>
		)
	}
}