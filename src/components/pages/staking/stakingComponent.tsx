import * as React from 'react';

import { withTranslation, WithTranslation } from 'react-i18next';

import { FarmPage } from '../../shared/FarmPage';
import { farmsList } from '../../listStaking';

export type FarmProps = {};
export type FarmState = {};

/**
 * Raptor Staking (stake RPTR, BSC).
 *
 * All the pool lifecycle, polling and card rendering lives in the shared
 * FarmPage component; this page only supplies the static farm list config.
 */
class StakingComponent extends FarmPage {

	constructor(props: FarmProps & WithTranslation) {
		super(props);
	}

	protected get pageConfig(): { [key: string]: any } {
		return {
			title: 'Staking',
			paragraphKey: 'staking.paragraph3',
			transKey: 'staking.paragraph2',
			farmsList: farmsList,
			showLP: false,
			pollIntervalMs: 10000,
			connectChainId: 56,
		};
	}
}

export default withTranslation()(StakingComponent);
