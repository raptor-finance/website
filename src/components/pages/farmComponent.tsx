import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';
import { RaptorLottery } from '../contracts/lottery';


import './farmComponent.css';

export type FarmProps = {};
export type FarmState = {
	farm?: RaptorFarm,
	wallet?: Wallet,
	looping?: boolean,

	address?: string,
	balance?: number,
	lpbalance?: number,
	stakedlp?: number,
  rewards?: number,
}
};

class FarmComponent extends BaseComponent<FarmProps & WithTranslation, FarmState> {

  constructor(props) {
    super(props);
  }

  render() {
    const t: TFunction<"translation"> = this.readProps().t;

    return <div>

    </div>
  }
}

export default withTranslation()(FarmComponent);
