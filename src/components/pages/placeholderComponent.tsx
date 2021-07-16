import * as React from 'react';

import { css } from '@emotion/react';
import { pulse } from 'react-animations';
import { withTranslation, WithTranslation, TFunction } from 'react-i18next';
import { Bounce } from 'react-reveal';
import { ScaleLoader } from 'react-spinners';
import { BaseComponent } from '../shellInterfaces';
import styled, { keyframes } from 'styled-components';

import './placeholderComponent.css';

export type PlaceholderProps = {};
export type PlaceholderState = {};

const override = css`
    display: table;
    margin: 0 auto;
`;

const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 5s ${PulseAnimation};
`;

class PlaceholderComponent extends BaseComponent<PlaceholderProps & WithTranslation, PlaceholderState> {

  constructor(props) {
    super(props);
  }

  render() {
    const t: TFunction<"translation"> = this.readProps().t;

    return <div className="placeholder-container">
      <Bounce top>
        <PulseDiv>
          <h1>
            <strong>
              {t('swap.title')}
            </strong>
          </h1>
        </PulseDiv>
      </Bounce>
      <ScaleLoader css={override} color={"#C43194"} width={16} height={40} margin={8} radius={4} speedMultiplier={1.2} />
    </div>
  }
}

export default withTranslation()(PlaceholderComponent);
