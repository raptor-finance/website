import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../../shellInterfaces';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { YourTokenBackend } from '../../contracts/yourtoken';

// import './migrationComponent.css';
// import './stakingComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type YourTokenProps = {};
export type YourTokenStats = {
	wallet?: Wallet,
	backend?: YourTokenBackend,
	pending?: boolean,
	looping?: boolean,
	address?: string,
	name?: string,
	symbol?: string,
	supply?: string,
	tokenAddress?: string,
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class YourTokenComponent extends BaseComponent<YourTokenProps & withTranslation, YourTokenStats> {
	
	private lock: boolean;
	
	constructor(props: YourTokenProps & WithTranslation) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.deploy = this.deploy.bind(this);
		this.onNameChanged = this.onNameChanged.bind(this);
		this.onSymbolChanged = this.onSymbolChanged.bind(this);
		this.onSupplyChanged = this.onSupplyChanged.bind(this);
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
	}
	
	onNameChanged(event) {
		const name = event.target.value;
		this.updateState({ name:name });
	}
	
	onSymbolChanged(event) {
		const symbol = event.target.value;
		this.updateState({ symbol:symbol });
	}

	onSupplyChanged(event) {
		const supply = event.target.value;
		this.updateState({ supply:supply });
	}
	
	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect(1380996178);
			const backend = new YourTokenBackend(wallet);

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			await backend.refresh();
			this.updateState({ wallet: wallet, backend: backend, address: wallet.currentAddress,looping: true, pending: false, supply: "0", name: "", symbol: "" });
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

			this.updateState({ wallet: null, backend: null, address: null, looping: false, pending: false });
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
	async deploy() {
		let state = this.readState();
		console.log(state);
		const tokenAddress = (await state.backend.deploy(state.name, state.symbol, state.supply));
		await state.backend.refresh();
		this.updateState({tokenAddress: tokenAddress});
		this.updateOnce(true);
	}
	

	render() {
		this.updateOnce(false);
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
							<h2>Balance</h2>
							<AnimatedNumber
								value={numeral(coinBalance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `RaptorChain-side Raptor Balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								// className="staking-info"
							>
								0 Raptor
							</AnimatedNumber>
								Name : <input onChange={this.onNameChanged} value={state.name}></input>
								Symbol : <input onChange={this.onSymbolChanged} value={state.symbol}></input>
								Supply : <input type="number" onChange={this.onSupplyChanged} value={state.supply}></input>
					         	<button id="btn-deploy" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.deploy}>Deploy</button>
								<div>{state.tokenAddress}</div>
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