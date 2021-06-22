import * as React from 'react';

import {BaseComponent} from '../shellInterfaces';

export type StaticHtmlProps = {
	src: string;
};

export class StaticHtmlComponent extends BaseComponent<StaticHtmlProps, {}> {
	render() {
		function getHtml(s) {

			if (Array.isArray(s)) {
				return s.map(getHtml).join('');
			}

			if (!s) {
				return ""
			}
			if (!!s.default) return typeof s.default === "string" ? s.default : "";
			return s;
		}

		const template = {__html: getHtml(this.readProps().src)};
		return <div dangerouslySetInnerHTML={template}/>;
	}
}
