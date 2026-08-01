import * as React from 'react';

import { withTranslation, WithTranslation } from 'react-i18next';

import { FarmPage } from '../../shared/FarmPage';
import { Wallet } from '../../wallet';
import { RaptorFarm } from '../../contracts/raptorfarm';
import { farmsList } from '../../listOfFarmsv2';

export type FarmProps = {};
export type FarmState = {};

/**
 * Raptor Farm V2 (deprecated old pools on BSC).
 *
 * Unlike the v3 farm, RaptorFarm requires a connected wallet, so the pool list
 * is built inside buildSession() instead of componentDidMount(). Everything
 * else (polling, cards, buttons) is shared FarmPage behaviour.
 */
class FarmComponentv2 extends FarmPage {

	constructor(props: FarmProps & WithTranslation) {
		super(props);
	}

	/** v2 pools can't be built without a wallet; nothing to do at mount time. */
	protected async buildFarm(): Promise<{ [pid: string]: any }> {
		return {};
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const farm: any = {};
		farm[`0,0`] = new RaptorFarm(wallet, 0);

		const poolLengthOld = (await farm[`0,0`].contract.methods.poolLength().call());
		var i = 1;
		while (i < poolLengthOld) {
			farm[`0,${i}`] = new RaptorFarm(wallet, i);
			i += 1;
		}

		this.updateState({ farm: farm, wallet: wallet, looping: true });
	}

	protected get pageConfig(): { [key: string]: any } {
		return {
			title: 'Farm',
			titleSuffix: 'V2 (Deprecated)',
			paragraphKey: 'farm.paragraph1old',
			transKey: 'farm.paragraph2',
			farmsList: farmsList,
			showLP: true,
			// The v2 card never rendered the TVL row or the ad iframe.
			showTVL: false,
			showAd: false,
			farmVersion: '0',
			pollIntervalMs: 10000,
			connectChainId: 56,
		};
	}
}

export default withTranslation()(FarmComponentv2);
