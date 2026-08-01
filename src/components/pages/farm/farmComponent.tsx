import * as React from 'react';

import { withTranslation, WithTranslation } from 'react-i18next';

import { FarmPage } from '../../shared/FarmPage';
import { farmsList } from '../../listOfFarms';

export type FarmProps = {};
export type FarmState = {};

/**
 * Raptor Farm (v3 pools on BSC).
 *
 * All the pool lifecycle, polling and card rendering lives in the shared
 * FarmPage component; this page only supplies the static farm list config.
 */
class FarmComponent extends FarmPage {

	constructor(props: FarmProps & WithTranslation) {
		super(props);
	}

	protected get pageConfig(): { [key: string]: any } {
		return {
			title: 'Farm',
			paragraphKey: 'farm.paragraph1',
			transKey: 'farm.paragraph2',
			farmsList: farmsList,
			showLP: true,
			pollIntervalMs: 10000,
			connectChainId: 56,
		};
	}
}

export default withTranslation()(FarmComponent);
