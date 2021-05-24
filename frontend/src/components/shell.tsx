import * as React from "react";

import {ShellNav} from "./shellNav";
import {ShellHost} from "./shellHost";
import {BaseComponent, IShellPage, ShellNavigator} from "./shellInterfaces";

import './shell.css';

export type ShellProps = {
	pages: IShellPage[];
};
export type ShellState = {
	currentPage: IShellPage
};

export class Shell extends BaseComponent<ShellProps, ShellState> {

	private readonly _navigator: ShellNavigator;

	constructor(props: ShellProps) {
		super(props);
		this._navigator = new ShellNavigator();
	}

	render() {
		const pages = this.readProps().pages;

		return <div className="main-wrapper">
			<ShellNav navigator={this._navigator} pages={pages} />
			<div className="content-wrapper">
				<ShellHost navigator={this._navigator} firstPage={pages[0]} />
			</div>
		</div>
	}
}

