import * as React from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useRouteMatch,
	useParams
} from "react-router-dom";

import ShellNav from "./shellNav";
import { ShellHost } from "./shellHost";
import { BaseComponent, IShellPage } from "./shellInterfaces";
import './shell.css';


export type ShellProps = {
	pages: IShellPage[];
};
export type ShellState = {
	currentPage: IShellPage
};

export class Shell extends BaseComponent<ShellProps, ShellState> {

	constructor(props: ShellProps) {
		super(props);
	}

	render() {
		const pages = this.readProps().pages;
		return <Router>
			<div className="main-wrapper">
				<ShellNav pages={pages} />
				<div className="content-wrapper">

					<Switch>
						{pages.map(page => (
							<Route key={`${page.id}`} path={'/' + page.id}>
								<ShellHost page={page} />
							</Route>
						))}
						<Route path="/">
							<ShellHost page={pages[0]} />
						</Route>

					</Switch>
				</div>
			</div>
		</Router>
	}
}

