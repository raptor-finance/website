import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';

import './farmComponent.css';

export type FarmProps = {};
export type FarmState = {};

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
