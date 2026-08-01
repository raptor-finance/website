import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { CHAIN, RPTR_TOKEN } from '../../../config';
import './migrationComponent.css';
import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import '../../../theme/custom.css';

export type MigrationProps = {};
export type MigrationState = WalletPageState & {
	raptor?: Raptor,
	balance?: number,
	balancev3?: number,
	ctValue?: number,
	ctValueOut?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class MigrationComponent extends WalletPageBase<MigrationProps & WithTranslation, MigrationState> {

	constructor(props: MigrationProps & WithTranslation) {
		super(props);
		this.migrate = this.migrate.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.handleAmountOutUpdate = this.handleAmountOutUpdate.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.state = {} as MigrationState;
	}

	protected get connectChainId(): number {
		return CHAIN.BSC;
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const raptor = new Raptor(wallet);
		this.updateState({ raptor: raptor, looping: true, ctValue: 0 });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
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
			}
			catch (e) {
				console.warn('Unable to update migration status', e);
			}
		}
		else {
			return false;
		}
		return true;
	}

	protected resetState(): void {
		this.updateState({ raptor: null });
	}

	handleAmountUpdate(event) {
		let valueIn = event.target.value;
		let valueOut = (event.target.value / 10 ** 6);
		this.updateState({ ctValue: valueIn, ctValueOut: valueOut });
	}

	handleAmountOutUpdate(event) {
		let valueIn = (event.target.value * (10 ** 6));
		let valueOut = event.target.value;
		this.updateState({ ctValue: valueIn, ctValueOut: valueOut });
	}

	setMaxAmount() {
		const state = this.readState();
		let valueIn = state.balance;
		let valueOut = state.balance / 10 ** 6;
		this.updateState({ ctValue: valueIn, ctValueOut: valueOut });
	}

	async migrate() {
		let state = this.readState();
		await state.raptor.migrate(state.ctValue);
		await state.raptor.refresh();
		this.refreshOnce(true);
	}

	async addToMetamask() {
		// Delegate to Wallet so the request is routed through the connected
		// provider (providerRequest) instead of the global window.ethereum,
		// which may belong to a different wallet extension.
		const wallet = this.readState().wallet || new Wallet();
		await wallet.addTokenToMetamask(RPTR_TOKEN[CHAIN.BSC], "RPTR", 18, "https://raptorchain.io/images/logo.png");
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
							<WalletConnectButton
								connected={!!state.address}
								pending={state.pending}
								onConnect={this.connectWallet}
								onDisconnect={this.disconnectWallet}
							/>
						</div>
					</div>
				</div>



				<FadeInLeftDiv className="col-md-6 d-flex">
					<div className="shadow d-flex flex-column flex-fill gradient-card primary smoothDiv">
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
						</div><div>You will get {(state.ctValue / 1000000)} RPTR</div>
						<br />
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
