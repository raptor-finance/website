import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet } from '../../wallet';
import { YourTokenBackend } from '../../contracts/yourtoken';
import { CHAIN } from '../../../config';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type YourTokenProps = {};
export type YourTokenStats = WalletPageState & {
	backend?: YourTokenBackend,
	name?: string,
	symbol?: string,
	supply?: string,
	tokenAddress?: string,
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class YourTokenComponent extends WalletPageBase<YourTokenProps & WithTranslation, YourTokenStats> {

	constructor(props: YourTokenProps & WithTranslation) {
		super(props);
		this.deploy = this.deploy.bind(this);
		this.onNameChanged = this.onNameChanged.bind(this);
		this.onSymbolChanged = this.onSymbolChanged.bind(this);
		this.onSupplyChanged = this.onSupplyChanged.bind(this);
		this.state = {} as YourTokenStats;
	}

	protected get connectChainId(): number {
		return CHAIN.RAPTORCHAIN;
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const backend = new YourTokenBackend(wallet);
		await backend.refresh();
		this.updateState({ backend: backend, address: wallet.currentAddress, looping: true, supply: "0", name: "", symbol: "" });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
		const backend = this.readState().backend;
		if (!!backend) {
			try {
				await backend.refresh();
			}
			catch (e) {
				console.warn('Unable to update backend status', e);
			}
		}
		else {
			return false;
		}
		return true;
	}

	protected resetState(): void {
		this.updateState({ backend: null });
	}

	onNameChanged(event) {
		const name = event.target.value;
		this.updateState({ name: name });
	}

	onSymbolChanged(event) {
		const symbol = event.target.value;
		this.updateState({ symbol: symbol });
	}

	onSupplyChanged(event) {
		const supply = event.target.value;
		this.updateState({ supply: supply });
	}

	async deploy() {
		let state = this.readState();

		const tokenAddress = (await state.backend.deploy(state.name, state.symbol, state.supply));
		await state.backend.refresh();
		this.updateState({ tokenAddress: tokenAddress });
		this.refreshOnce(true);
	}


	render() {
		const state = this.readState();
		const backend = state.backend;
		console.log((!!backend) ? `Loaded balance : ${backend.balance}` : `Backend not connected`);
		const coinBalance = (!!backend) ? backend.balance : 0;
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">

			<div className="container">
				<div className="row text-white staking-header">
					<div className="col-md-12">
						<div className="migration-title">
							<b><font size="6"><span>Raptor</span><span style={{ color: "#31c461" }}>Chain</span></font></b>
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
					<div className="shadow d-flex flex-column flex-fill gradient-card primary">
						<h2>{t('migration.wallet.wallet_address')}</h2>
						<p>{state.address || t('migration.wallet.connect_wallet')}</p>
						<AnimatedNumber
							value={numeral(coinBalance || 0).format('0.00')}
							duration="1000"
							formatValue={value => `Mainnet balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} RPTR`}
							// className="staking-info"
						>
							0 RPTR
						</AnimatedNumber>
						<h2>Deploy your token</h2>
						Name<input placeholder="Ex: Bitcoin" onChange={this.onNameChanged} value={state.name}></input>
						Ticker<input placeholder="Ex: BTC" onChange={this.onSymbolChanged} value={state.symbol}></input>
						Total Supply<input placeholder="Ex: 21000000" type="number" onChange={this.onSupplyChanged} value={state.supply}></input>
						<button id="btn-deploy" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.deploy}>Deploy</button>
						<div>Token address : {state.tokenAddress || "Please deploy token first !"}</div>
					</div>


				</FadeInLeftDiv>

				<div className="migration-footer">
					<font size="2"><i>Made with &#x2764;&#xFE0F; and &#9749; by <a href="https://github.com/ygboucherk">Yanis</a> from <a href="https://raptorchain.io">RaptorChain</a></i></font>
				</div>



			</div>
		</div>
	}
}

export default withTranslation()(YourTokenComponent);