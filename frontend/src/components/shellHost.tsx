import * as React from "react";
import {BaseComponent, IShellPage, ShellNavigator} from "./shellInterfaces";

export type ShellHostProps = {
	navigator: ShellNavigator;
	firstPage: IShellPage;
};
export type ShellHostState = {
	currentPage?: IShellPage;
};

export class ShellHost extends BaseComponent<ShellHostProps, ShellHostState> {

	constructor(props: ShellHostProps) {
		super(props);
	}
	componentDidMount() {
		const self = this;
		this.readProps().navigator.navigatingEvent().subscribe(e => self.onNavigating.call(self, e));
		this.onNavigating(this.readProps().firstPage);
	}

	render() {
		const page: IShellPage = this.readState().currentPage || {id: null, title: null, component: null};
		if (!page.component) {
			return null;
		}

		return React.createElement(page.component, page.componentProps || {})
	}

	private onNavigating(page: IShellPage) {
		this.updateState({currentPage: page});
	}
}

export type StaticHtmlProps = {
	src: string;
}

export class StaticHtml extends BaseComponent<StaticHtmlProps, {}> {
	render() {

		console.log(this.props);

		function getHtml(s) {

			if (Array.isArray(s)) {
				return s.map(getHtml).join('');
			}

			if (!s) {return ""}
			if (!!s.default) return typeof s.default === "string" ? s.default : "";
			return s;
		}

		const template = {__html: getHtml(this.readProps().src) };
		return <div dangerouslySetInnerHTML={template} />;
	}
}
