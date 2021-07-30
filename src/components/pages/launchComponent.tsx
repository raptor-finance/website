import * as React from 'react';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';
import { ProgressBar } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import Countdown from 'react-countdown';
import Modal from 'react-modal';

import './launchComponent.css';

export type LaunchProps = {};
export type LaunchState = {
  showModal?: boolean,
  openedInput?: number,
};

const customStyles = {
  content: {
    backgroundColor: '#1A222E',
    width: '40%',
    top: '10%',
    left: '30%',
    right: 'auto',
    bottom: 'auto',
    borderColor: '#1A222E'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
};

class LaunchComponent extends BaseComponent<LaunchProps & WithTranslation, LaunchState> {

  constructor(props: LaunchProps & WithTranslation) {
    super(props);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.state = {
      openedInput: 0,
    };
  }

  openModal() {
    this.setState({
      showModal: true,
    })
  }

  closeModal() {
    this.setState({
      showModal: false,
    });
  }

  collapseOtherDivs(id) {
    this.setState({
      openedInput: id,
    });
  }

  nextInput(e) {
    e.preventDefault();

    var currentInput = this.state.openedInput;
    var newInput = currentInput + 1;

    this.setState({
      openedInput: newInput,
    })
  }

  previousInput(e) {
    e.preventDefault();

    var currentInput = this.state.openedInput;
    var newInput = currentInput - 1;

    this.setState({
      openedInput: newInput,
    })
  }

  handleCheckbox(event) {
    var checkbox = document.getElementById('confirm')
    var button = document.getElementById('confirmButton')

    if (checkbox.checked) {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  }

  LaunchBullet({ num }) {
    return <div className="col-md-1">
      <div className="launch-bullet d-flex align-items-center justify-content-center shadow">
        <h2>{num}</h2>
      </div>
    </div>
  }

  LaunchCard({
    logoSource,
    tokenName,
    projectName,
    presaleRate,
    amountRaised,
    softCap,
    hardCap,
    minContribution,
    maxContribution,
    participants,
    timeUntilPresale,
    translateProps,
  }) {
    const t = translateProps

    var progressBarPercent = (amountRaised / hardCap * 100);

    return <div className="col-md-3">
      <a className="gradient-card dark shadow d-block">
        <div className="d-flex align-items-center upcoming-launch-header justify-content-between">
          <img src={logoSource} className="launch-icon shadow" />
          <div>
            <h2>${tokenName}</h2>
            <h3>{projectName}</h3>
          </div>
        </div>
        <div className="upcoming-launch-body">
          <h4>1 {t('launch.bnb')} = {presaleRate} {tokenName}</h4>
          <div>
            <h2>{amountRaised}/{hardCap} {t('launch.bnb')}</h2>
            <h3>{t('launch.raised')}</h3>
          </div>
          <ProgressBar striped animated now={progressBarPercent} />
          <div className="d-flex justify-content-between">
            <p>{t('launch.soft_cap')}:</p>
            <p>{softCap} {t('launch.bnb')}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>{t('launch.min_cont')}:</p>
            <p>{minContribution} {t('launch.bnb')}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>{t('launch.max_cont')}:</p>
            <p>{maxContribution} {t('launch.bnb')}</p>
          </div>
          <div className="d-flex justify-content-between">
            <p>{t('launch.participants')}:</p>
            <p>{participants}</p>
          </div>
          <hr />
          <p style={{ textAlign: "center" }}>{t('launch.countdown')}:</p>
          <div className="d-flex justify-content-center">
            <Countdown
              date={Date.now() + timeUntilPresale}
            />
          </div>
        </div>
      </a>
    </div>
  }

  render() {
    const t = this.readProps().t

    return <div className="launch-container">
      <div className="row text-white launch-header">
        <div className="col-md-12">
          <div className="launch-title">
            <span>Raptor</span>
            <span style={{ color: "#31c461" }}>Launch</span>
          </div>
        </div>

        <p>{t('launch.paragraph1')}</p>
        <p>{t('launch.paragraph2')}</p>
        <div>
          <button onClick={this.openModal} className="btn btn-golden">Launch your project</button>
        </div>
      </div>
      <Modal
        isOpen={this.state.showModal}
        onRequestClose={this.closeModal}
        style={customStyles}
      >
        <div className="launch-modal">
          <h1>Create Presale</h1>
          <form>
            <div className="d-flex">
              <this.LaunchBullet num={1} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Token Address"
                  open={this.state.openedInput == 0}
                  onTriggerOpening={() => this.collapseOtherDivs(0)}
                  transitionTime={240}
                >
                  <p>Enter your token address</p>
                  <input placeholder="Ex. 0x" />
                  <p>Token Name:</p>
                  <p>Token Symbol:</p>
                  <p>Decimals:</p>
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={2} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Presale Rate"
                  open={this.state.openedInput == 1}
                  onTriggerOpening={() => this.collapseOtherDivs(1)}
                  transitionTime={240}
                >
                  <p>Enter your presale price: (Number of tokens per 1 BNB)</p>
                  <input placeholder="Ex. 200" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={3} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Soft/Hard Cap"
                  open={this.state.openedInput == 2}
                  onTriggerOpening={() => this.collapseOtherDivs(2)}
                  transitionTime={240}
                >
                  <p>Enter the presale caps. Soft cap must be greater than, or equal to 50% of hard cap.</p>
                  <p>Soft Cap:</p>
                  <input placeholder="Ex. 50" />
                  <p>Hard Cap:</p>
                  <input placeholder="Ex. 100" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={4} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Contribution Limits"
                  open={this.state.openedInput == 3}
                  onTriggerOpening={() => this.collapseOtherDivs(3)}
                  transitionTime={240}
                >
                  <p>Enter the minimum and maximum amounts purchasable by one wallet.</p>
                  <p>Minimum:</p>
                  <input placeholder="Ex. 0.1" />
                  <p>Maximum:</p>
                  <input placeholder="Ex. 2.0" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={5} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Liquidity Allocation"
                  open={this.state.openedInput == 4}
                  onTriggerOpening={() => this.collapseOtherDivs(4)}
                  transitionTime={240}
                >
                  <p>Enter the percentage of raised funds to be allocated to the liquidity on RaptorSwap: (Minimum of 51%)</p>
                  <input placeholder="Ex. 70" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={6} />
              <div className="col-md-11">
                <Collapsible
                  trigger="RaptorSwap Rate"
                  open={this.state.openedInput == 5}
                  onTriggerOpening={() => this.collapseOtherDivs(5)}
                  transitionTime={240}
                >
                  <p>Enter the RaptorSwap listing price: (Number of tokens per 1 BNB)</p>
                  <input placeholder="Ex. 100" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={7} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Project Information"
                  open={this.state.openedInput == 6}
                  onTriggerOpening={() => this.collapseOtherDivs(6)}
                  transitionTime={240}
                >
                  <p>Logo URL: (Must end supported image format, e.g. png, jpeg, jpg. PNG preferred.)</p>
                  <input placeholder="Ex. https://raptr.finance/raptor-logo.png" />
                  <p>Project Description:</p>
                  <input placeholder="Ex. Raptor Finance is a decentralized..." />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={8} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Project Links"
                  open={this.state.openedInput == 7}
                  onTriggerOpening={() => this.collapseOtherDivs(7)}
                  transitionTime={240}
                >
                  <p>Website URL:</p>
                  <input placeholder="Ex. https://raptr.finance/" />
                  <p>Telegram Link:</p>
                  <input placeholder="Ex. https://t.me/PhilosoRaptorToken" />
                  <div className="d-flex justify-content-end">
                    <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                    <button onClick={(e) => this.nextInput(e)} className="btn btn-small btn-complementary">Next</button>
                  </div>
                </Collapsible>
              </div>
            </div>
            <div className="d-flex">
              <this.LaunchBullet num={9} />
              <div className="col-md-11">
                <Collapsible
                  trigger="Presale Timings"
                  open={this.state.openedInput == 8}
                  onTriggerOpening={() => this.collapseOtherDivs(8)}
                  transitionTime={240}
                >
                  <p>Presale Start:</p>
                  <input type="datetime-local" />
                  <p>Presale End:</p>
                  <input type="datetime-local" />
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                      <input type="checkbox" id="confirm" onClick={this.handleCheckbox} />
                      <label>I have confirmed that the information above is correct</label>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button onClick={(e) => this.previousInput(e)} className="btn btn-small btn-dark">Back</button>
                      <button id="confirmButton" disabled={true} className="btn btn-small btn-complementary">Finish</button>
                    </div>
                  </div>
                </Collapsible>
              </div>
            </div>
          </form>
        </div>
      </Modal>
      <div className="upcoming-launches">
        <h1><u>Upcoming</u> Launches</h1>
        <div className="card-grid d-flex">
          <this.LaunchCard
            logoSource="images/logo.png"
            tokenName="RAPTOR"
            projectName="Raptor Finance"
            presaleRate={1000}
            amountRaised={40}
            softCap={50}
            hardCap={100}
            minContribution={0.1}
            maxContribution={2.0}
            participants={30}
            timeUntilPresale={10}
            translateProps={t}
          />
          <this.LaunchCard
            logoSource="images/logo.png"
            tokenName="SAFERAPTOR"
            projectName="SafeRaptor"
            presaleRate={100000}
            amountRaised={20}
            softCap={200}
            hardCap={1000}
            minContribution={0.1}
            maxContribution={5.0}
            participants={36}
            timeUntilPresale={60000}
            translateProps={t}
          />
          <this.LaunchCard
            logoSource="images/logo.png"
            tokenName="RAPTOR"
            projectName="Raptor Finance"
            presaleRate={1000}
            amountRaised={40}
            softCap={50}
            hardCap={100}
            minContribution={0.1}
            maxContribution={2.0}
            participants={30}
            timeUntilPresale={10}
            translateProps={t}
          />
          <this.LaunchCard
            logoSource="images/logo.png"
            tokenName="RAPTOR"
            projectName="Raptor Finance"
            presaleRate={1000}
            amountRaised={40}
            softCap={50}
            hardCap={100}
            minContribution={0.1}
            maxContribution={2.0}
            participants={30}
            timeUntilPresale={10}
            translateProps={t}
          />
        </div>
      </div>
    </div>
  }
}

export default withTranslation()(LaunchComponent);
