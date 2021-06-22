import * as React from 'react';

import { BaseComponent } from './shellInterfaces';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { Fade } from 'react-reveal';
import { fadeIn } from 'react-animations';
import styled, { keyframes } from 'styled-components';

import './roadmap.css';

export type RoadmapProps = {};
export type RoadmapState = {
  currentTab?: number;
};

const FadeInAnimation = keyframes`${fadeIn}`;
const FadeInDiv = styled.div`
  animation: ease-in 0.4s ${FadeInAnimation};
`;

class Roadmap extends BaseComponent<RoadmapProps & WithTranslation, RoadmapState> {

  constructor(props: RoadmapProps & WithTranslation) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  handleClick(currentTab) {
		this.setState({ currentTab });
	}

  render() {
    const state = this.readState();
    const t: TFunction<"translation"> = this.readProps().t;

    const data = [
      {
        id: "1",
        name: "Q2",
        header: t('about.our_roadmap.q2_2021.title'),
        items: [
          { text: t('about.our_roadmap.q2_2021.line1'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line2'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line3'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line4'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line5'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line6'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line7'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line8'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line9'), done: "complete", },
          { text: t('about.our_roadmap.q2_2021.line10'), done: "complete", },
        ],
      },
      {
        id: "2",
        name: "Q3",
        header: t('about.our_roadmap.q3_2021.title'),
        items: [
          { text: t('about.our_roadmap.q3_2021.line1'), done: "wip", },
          { text: t('about.our_roadmap.q3_2021.line2'), done: "wip", },
          { text: t('about.our_roadmap.q3_2021.line3'), done: "wip", },
          { text: t('about.our_roadmap.q3_2021.line4'), done: "wip", },
        ],
      },
      {
        id: "3",
        name: "Q4",
        header: t('about.our_roadmap.q4_2021.title'),
        items: [
          { text: t('about.our_roadmap.q4_2021.line1'), done: "wip", },
          { text: t('about.our_roadmap.q4_2021.line2'), done: "wip", },
          { text: t('about.our_roadmap.q4_2021.line3'), done: "wip", },
          { text: t('about.our_roadmap.q4_2021.line4'), done: "wip", },
          { text: t('about.our_roadmap.q4_2021.line5'), done: "wip", },
          { text: t('about.our_roadmap.q4_2021.line6'), done: "wip", },
        ],
      },
      {
        id: "4",
        name: "Q1",
        header: t('about.our_roadmap.q1_2022.title'),
        items: [
          { text: t('about.our_roadmap.q1_2022.line1'), done: "wip", },
          { text: t('about.our_roadmap.q1_2022.line2'), done: "wip", },
        ],
      },
    ];

    return <div className="roadmap">
      <Fade bottom>
        <h1 className="justify-content-center"><strong className="title-white align-self-center">{t('about.our_roadmap.title')}</strong></h1>
        <p className="justify-content-center text-align-center">{t('about.our_roadmap.paragraph')}</p>
      </Fade>
      <div className="row">
        <Fade bottom>
          <div className="tab col-md-1">
            {data.map((button, i) => (
              <React.Fragment>
                <button key={button.name} className="btn-roadmap" style={{ backgroundColor: this.state.currentTab == i ? "var(--primary)" : "var(--white)" }} onClick={() => this.handleClick(i)}>{button.name}</button>
                {i < data.length - 1 &&
                  <div className="line"></div>
                }
              </React.Fragment>
            )
            )
            }
          </div>
        </Fade>
        <Fade bottom>
          <div className="roadmap-content col-md-11">
            {this.state.currentTab !== -1 &&
              <React.Fragment>
                <Fade spy={this.state.currentTab}>
                  <h2>{data[this.state.currentTab].header}</h2>
                  <ul className="roadmap-list">
                    {data[this.state.currentTab].items.map((li, i) => (
                      <li className={li.done}>{li.text}</li>
                    )
                    )
                    }
                  </ul>
                </Fade>
              </React.Fragment>
            }
          </div>
        </Fade>
      </div>
    </div>
  }
}

export default withTranslation()(Roadmap);
