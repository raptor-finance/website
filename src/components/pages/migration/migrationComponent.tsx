import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import './migrationComponent.css';
import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type MigrationProps = {};
export type MigrationState = {
	raptor?: Raptor,
	wallet?: Wallet,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	balance?: number,
	balancev3?: number,
	ctValue?: number,
	ctValueOut?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class MigrationComponent extends BaseComponent<MigrationProps & withTranslation, MigrationState> {
	
	private lock: boolean;
	
	constructor(props: MigrationProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.migrate = this.migrate.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.state = {};
	}
	
	handleError(error) {
		ShellErrorHandler.handle(error);
	}
	
	private async loop(): Promise<void> {
		const self = this;
		const cont = await self.updateOnce.call(self);

		if (cont) {
			this._timeout = setTimeout(async () => await self.loop.call(self), 1000);
		}
	}
	
	private async updateOnce(resetCt?: boolean): Promise<boolean> {
		const raptor = this.readState().raptor;
		if (!!raptor) {
			try {
				await raptor.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: raptor.wallet.currentAddress,
					balance: raptor.balance,
					balancev3: raptor.balancev3,
				});

				if (resetCt) {
					this.updateState({
					})
				}

			}
			catch (e) {
				console.warn('Unable to update migration status', e);
			}
		}
		else {
			return false;
		}
	}
	
	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const raptor = new Raptor(wallet);

			this.updateState({ raptor: raptor, wallet: wallet, looping: true, pending: false, ctValue: 0 });
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async disconnectWallet() {
		try {
			this.updateState({ pending: true });
			const result = await this.state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}

			this.updateState({ raptor: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}
	
	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
		  this.connectWallet();
		}
	}

	componentWillUnmount() {
	}
	
	handleAmountUpdate(event) {
		let valueIn = event.target.value;
		let valueOut = (event.target.value/10**6);
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	handleAmountOutUpdate(event) {
		let valueIn = (event.target.value*(10**6));
		let valueOut = event.target.value;
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	setMaxAmount() {
		const state = this.readState();
		let valueIn = state.balance;
		let valueOut = state.balance/10**6;
		this.updateState({ ctValue:valueIn, ctValueOut:valueOut });
	}
	
	async migrate() {
		let state = this.readState();
		console.log(state);
		await state.raptor.migrate(state.ctValue);
		await state.raptor.refresh();
		this.updateOnce(true);
	}
	
	async addToMetamask() {
		await ethereum.request({method: 'wallet_watchAsset',params: {type: 'ERC20',options: {address: "0x44c99ca267c2b2646ceec72e898273085ab87ca5",symbol: "RPTR",decimals: 18,image: "https://raptorchain.io/images/logo.png",},},});
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">

			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
							<div className="migration-title">
							<b><font size="6"><span>Raptor</span><span style={{ color: "#31c461" }}> Migration</span></font></b>
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.disconnectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									Disconnect wallet
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" disabled={state.pending} role="button" onClick={this.connectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									Connect wallet
								</a>)
							}
					        </div>
				     </div>
		       	</div>



                    <FadeInLeftDiv className="col-md-6 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<h2>{t('migration.wallet.v2')}</h2>
							<AnimatedNumber
								value={numeral(state.balance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
							<p>Enter the amount that you want to migrate:</p>
							<div>		
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.ctValue}></input><button className="btns-migrate" id="btn-max" onClick={this.setMaxAmount}>Max</button>
                            </div><div>You will get {(state.ctValue/1000000)} RPTR</div>
							<br/>
							<h2>{t('migration.wallet.v3')}</h2>
							<AnimatedNumber
								value={numeral(state.balancev3 || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value)).toLocaleString('en')}`}
								className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
                            <div className="d-flex justify-content-center button-row">
					         	<button id="btn-migrate" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.migrate}>Migrate</button>
								<button id="btn-addtometa" className="btn btn-complementary btn-md link-dark align-self-center stake-claim" onClick={this.addToMetamask}>Add to metamask</button>
					        </div>
						</div>


					</FadeInLeftDiv>

                          <div className="migration-footer">
					        <font size="2"><i>Note : With the above form you can migrate to the latest Raptor V3. No additional fees are applied.</i></font>
				          </div>



			</div>
		</div>
	}
}

export default withTranslation()(MigrationComponent);
