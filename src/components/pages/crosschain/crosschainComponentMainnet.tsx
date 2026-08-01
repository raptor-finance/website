import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet, ReadOnlyProvider, ChainNames, ChainIDsToRefresh } from '../../wallet';
import { RaptorChainInterface } from '../../contracts/chain';
import { CHAIN } from '../../../config';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import '../../../theme/custom.css';
import './migrationComponent.css';
import './stakingComponent.css';
import './crosschainComponent.css';
import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';

export class Step {
	constructor(name, description) {
		this.name = name;
		this.description = description;
		this.completed = false;
	}
}

export type CrossChainProps = {};
export type CrossChainState = WalletPageState & {
	chains?: any;
	bsc?: ReadOnlyProvider,
	polygon?: ReadOnlyProvider,
	chain?: RaptorChainInterface,
	ctValue?: number,
	chainIn?: number,
	chainOut?: number,
	steps?: any,
	currentStep?: number
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInRightAnimation = keyframes`${fadeInRight}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;
const FadeInRightDiv = styled.div`
  animation: ease-out 0.8s ${FadeInRightAnimation};
`;

class CrossChainComponentMainnet extends WalletPageBase<CrossChainProps & WithTranslation, CrossChainState> {
	
	constructor(props: CrossChainProps & WithTranslation) {
		super(props);
		this.deposit = this.deposit.bind(this);
		this.withdraw = this.withdraw.bind(this);
		this.wrapToPolygon = this.wrapToPolygon.bind(this);
		this.unwrapFromPolygon = this.unwrapFromPolygon.bind(this);
		this.transfer = this.transfer.bind(this);
		this.handleAmountUpdate = this.handleAmountUpdate.bind(this);
		this.getBalance = this.getBalance.bind(this);
		this.handleChainInUpdate = this.handleChainInUpdate.bind(this);
		this.handleChainOutUpdate = this.handleChainOutUpdate.bind(this);
		this.setMaxAmount = this.setMaxAmount.bind(this);
		this.switchWalletChain = this.switchWalletChain.bind(this);
		this.transferProgress = this.transferProgress.bind(this);
		this.state = {} as CrossChainState;
	}
	
	protected get pollIntervalMs(): number {
		return 1000;
	}

	/** 0 = leave the wallet on its current chain (bridge switches chains itself). */
	protected get connectChainId(): number {
		return 0;
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const chain = new RaptorChainInterface(wallet, "https://rpc.raptorchain.io/", true);
		const bsc = wallet.getReadOnly(56);
		const polygon = wallet.getReadOnly(137);
		const fantom = wallet.getReadOnly(250);
		let _chains = { 56: bsc, 137: polygon, 250: fantom };
		this.updateState({ chain: chain, looping: true, ctValue: 0, bsc: bsc, polygon: polygon, chains: _chains, chainIn: 56, chainOut: CHAIN.RAPTORCHAIN });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
		const state = this.readState();
		if (!!state.chain) {
			try {
				await state.chain.refresh();
				await state.bsc.refresh();
				for (let n = 0; n < ChainIDsToRefresh.length; n++) {
					if (state.chains[ChainIDsToRefresh[n]]) {
						await state.chains[ChainIDsToRefresh[n]].refresh();
					}
				}

				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: state.wallet ? state.wallet.currentAddress : undefined,
				});
			}
			catch (e) {
				console.warn('Unable to update transfer status', e);
			}
		}
		else {
			return false;
		}
		return true;
	}

	protected resetState(): void {
		this.updateState({ chain: null, bsc: null, polygon: null, chains: null });
	}
	
	async switchWalletChain(chainid: number) {
		const state = this.readState();
		await state.wallet.switchNetwork(chainid);
	}
	
	async handleChainInUpdate(event) {
		const state = this.readState();
		
		let _chainIn = event.target.value;
		let _chainOut = (_chainIn == state.chainOut) ? state.chainIn : state.chainOut;
		
		await this.updateState({chainIn: _chainIn, chainOut: _chainOut });
	}
	
	async handleChainOutUpdate(event) {
		const state = this.readState();
		
		let _chainOut = event.target.value;
		let _chainIn = (_chainOut == state.chainIn) ? state.chainOut : state.chainIn;
		
		await this.updateState({chainOut: _chainOut, chainIn: _chainIn });
	}
	
	chainDisplay(chainName, chainID) {
		return <>
			<option value={chainID}>{chainName}</option>
		</>
	}
	
	chainList() {
		return <>
			{this.chainDisplay("BSC", 56)}
			{this.chainDisplay("RaptorChain", CHAIN.RAPTORCHAIN)}
			{this.chainDisplay("Polygon", 137)}
			{this.chainDisplay("Fantom", 250)}
		</>
	}
	
	chainSelector(_value, _updater) {
		return <>
			<select value={_value} onChange={_updater}>
				{this.chainList()}
			</select>
		</>
	}
	
	handleAmountUpdate(event) {
		let tokens = event.target.value;
		this.updateState({ ctValue:tokens });
	}
	
	transferStep(step) {
		return <div className={step.completed ? "progressCardCompleted" : "progressCardNotCompleted"}>
			{step.name} - {step.description}{step.completed ? " - Done" : ""}
		</div>
	}
	
	transferProgress() {
		let state = this.readState();
		if (!state.steps) {
			return <h3>Something will show up if you attempt something... just like your crush</h3>
		}
		return <>
			<div className="progressContainer">
				{(state.steps || []).map(this.transferStep)}
			</div>
		</>
	}
	
	getBalance(chainid: number) {
		const state = this.readState();
		if (!state.chain) {
			return 0;
		}
		if ((chainid == 56) && (state.bsc)) {
			return state.bsc.balance;
		} else if ((chainid == CHAIN.RAPTORCHAIN)) {
			return state.chain.balance;
		} else if (state.chains[chainid]) {
			return state.chains[chainid].balance;
		} else {
			return 0;
		}
	}
	
	async deposit() {
		await this.updateState({steps: [new Step("BSC", "Switch wallet to BSC"), new Step("Tx", "Send transaction")]});
		let state = this.readState();
		
		await this.switchWalletChain(56);
		state.steps[0].completed = true;
		
		await state.chain.crossChainDeposit(state.ctValue);
		state.steps[1].completed = true;
		
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async withdraw() {
		await this.updateState({steps: [new Step("Sign", "Sign message")]});
		let state = this.readState();
		await state.chain.crossChainWithdrawal(state.ctValue);
		state.steps[0].completed = true;
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async wrapToPolygon() {
		await this.updateState({steps: [new Step("Chain", "Switch wallet to RaptorChain"), new Step("Send", "Send transaction")]});
		let state = this.readState();
		await this.switchWalletChain(CHAIN.RAPTORCHAIN);
		state.steps[0].completed = true;
		
		await state.chain.bridgeToPolygon(state.ctValue); // chain switch logic is managed inside `bridgeToPolygon`
		state.steps[1].completed = true;
		
		await state.polygon.refresh();
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async unwrapFromPolygon() {
		await this.updateState({steps: [new Step("Chain", "Switch wallet to Polygon"), new Step("Lock", "Send lock tx"), new Step("Chain", "Switch wallet to RaptorChain"), new Step("Claim", "Send claim tx")]});
		let state = this.readState();
		
		await this.switchWalletChain(137);
		state.steps[0].completed = true;
		
		let slotKey = await state.chain.initPolygonUnwrap(state.ctValue);
		state.steps[1].completed = true;
		
		await this.switchWalletChain(CHAIN.RAPTORCHAIN);
		state.steps[2].completed = true;
		
		await state.chain.finishPolygonUnwrap(slotKey);
		state.steps[3].completed = true;
	}
	
	async wrapTo(chainid) {
		await this.updateState({steps: [new Step("Chain", "Switch wallet to RaptorChain"), new Step("Send", "Send transaction")]});
		let state = this.readState();
		await this.switchWalletChain(CHAIN.RAPTORCHAIN);
		state.steps[0].completed = true;
		
		await state.chain.bridgeTo(chainid, state.ctValue); // chain switch logic is managed inside `bridgeToPolygon`
		state.steps[1].completed = true;
		
		await state.chains[chainid].refresh();
		await state.chain.refresh();
		this.updateOnce(true);
	}
	
	async unwrapFrom(chainid) {
		const _name = ChainNames[chainid];
		await this.updateState({steps: [new Step("Chain", `Switch wallet to ${_name}`), new Step("Lock", "Send lock tx"), new Step("Chain", "Switch wallet to RaptorChain"), new Step("Claim", "Send claim tx")]});
		let state = this.readState();
		
		await this.switchWalletChain(chainid);
		state.steps[0].completed = true;
		
		let slotKey = await state.chain.initUnwrap(chainid, state.ctValue);
		state.steps[1].completed = true;
		
		await this.switchWalletChain(CHAIN.RAPTORCHAIN);
		state.steps[2].completed = true;
		
		await state.chain.finishUnwrap(chainid, slotKey);
		state.steps[3].completed = true;
	}
	
	async transfer() {
		let state = this.readState();
		await this.updateState({pending:true}); // shows "loading"
		try {
			if ((state.chainIn == CHAIN.BSC) && (state.chainOut == CHAIN.RAPTORCHAIN)) {
				await this.deposit();
			} else if ((state.chainIn == CHAIN.RAPTORCHAIN) && (state.chainOut == CHAIN.BSC)) {
				await this.withdraw();
			} else if ((state.chainIn == CHAIN.RAPTORCHAIN) && (state.chainOut != CHAIN.RAPTORCHAIN)) {
				await this.wrapTo(state.chainOut);
			} else if ((state.chainIn != CHAIN.RAPTORCHAIN) && (state.chainOut == CHAIN.RAPTORCHAIN)) {
				await this.unwrapFrom(state.chainIn);
			} else {
				// EVM-to-EVM (e.g. Polygon -> Fantom) is not supported: the bridge
				// only moves between RaptorChain and a single EVM chain at a time.
				throw 'This transfer route is not supported. Bridge through RaptorChain instead.';
			}
		} catch (e) {
			this.handleError(e);
		} finally {
			await this.updateState({pending:false}); // stops showing "loading" once complete
		}
	}
	
	async setMaxAmount() {
		let state = this.readState();
		await this.updateState({ctValue: this.getBalance(state.chainIn)});
	}
	
	async addMainnetToMetamask() {
		// Delegate to Wallet so the request is routed through the connected
		// provider (providerRequest) instead of the global window.ethereum,
		// which may belong to a different wallet extension.
		const wallet = this.readState().wallet || new Wallet();
		await wallet.addMainnetToMetamask();
	}

	render() {
		const state = this.readState();
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


				<div className="row">
                    <FadeInLeftDiv className="col-md-6">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary smoothDiv">
							<h2>{t('migration.wallet.wallet_address')}</h2>
							<p>{state.address || t('migration.wallet.connect_wallet')}</p>
							<h2>Balance breakdown</h2>
							<div>
								{this.chainSelector(state.chainIn, this.handleChainInUpdate)}&nbsp;
								<AnimatedNumber
									value={numeral(this.getBalance(state.chainIn) || 0).format('0.00')}
									duration="1000"
									formatValue={value => `Balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								>
									0 Raptor
								</AnimatedNumber>&nbsp;
								<button onClick={this.setMaxAmount} className="btn btn-md btn-primary">Max</button>
							</div>
							<div>
								{this.chainSelector(state.chainOut, this.handleChainOutUpdate)}&nbsp;
								<AnimatedNumber
									value={numeral(this.getBalance(state.chainOut) || 0).format('0.00')}
									duration="1000"
									formatValue={value => `Balance : ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								>
									0 Raptor
								</AnimatedNumber>
							</div>
							<p>Enter the amount that you want to transfer:</p>
							<div>		
								<input className="input-amount" placeholder="Enter an amount..." onChange={this.handleAmountUpdate} value={state.ctValue}></input>
                            </div>
							<br/>
                            <div className="d-flex justify-content-center button-row">
					         	<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.transfer}>Transfer</button>
								<button id="btn-addtometa" className="btn btn-complementary btn-md link-dark align-self-center stake-claim" onClick={this.addMainnetToMetamask}>Add to Metamask</button>
					        </div>
						</div>
					</FadeInLeftDiv>
                    <FadeInRightDiv className="col-md-6">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary smoothDiv">
							<h1>Progress</h1>
							{this.transferProgress()}
						</div>
					</FadeInRightDiv>
				</div>
			  <div className="migration-footer">
				<font size="2"><i>Note : Funds usually take about 15 minutes to arrive, please be patient !</i></font>
			  </div>
			</div>
		</div>
	}
}

export default withTranslation()(CrossChainComponentMainnet);