import * as React from 'react';
import {BaseComponent} from "../shellInterfaces";
import {StaticHtml} from "../shellHost";

export class AboutPage extends BaseComponent<{}, {}> {

	render() {
		return <StaticHtml src={'../../content/about.html'} />
	}
}
