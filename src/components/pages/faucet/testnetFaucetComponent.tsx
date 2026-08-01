import * as React from 'react';
import * as numeral from 'numeral';

import { WithTranslation, withTranslation, TFunction } from 'react-i18next';
import { Wallet } from '../../wallet';
import { Raptor } from '../../contracts/raptor';
import { RaptorChainInterface } from '../../contracts/chain';

import { WalletPageBase, WalletPageState } from '../../shared/WalletPageBase';
import WalletConnectButton from '../../shared/WalletConnectButton';

import AnimatedNumber from 'animated-number-react';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';


export type TestnetFaucetProps = {};
export type TestnetFaucetState = WalletPageState & {
	raptor?: Raptor,
	chain?: RaptorChainInterface,
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;


class TestnetFaucetComponent extends WalletPageBase<TestnetFaucetProps & WithTranslation, TestnetFaucetState> {

	constructor(props: TestnetFaucetProps & WithTranslation) {
		super(props);
		this.claim = this.claim.bind(this);
		this.state = {} as TestnetFaucetState;
	}

	protected get connectChainId(): number {
		return 97; // BSC testnet
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		const chain = new RaptorChainInterface(wallet, "https://rptr-testnet-1.dynamic-dns.net/");
		const raptor = new Raptor(wallet);
		this.updateState({ raptor: raptor, chain: chain, looping: true });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
		const raptor = this.readState().raptor;
		const chain = this.readState().chain;
		if (!!raptor) {
			try {
				await raptor.refresh();
				await chain.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: raptor.wallet.currentAddress,
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
		this.updateState({ raptor: null, chain: null });
	}

	async claim() {
		let state = this.readState();
		const tx = (await state.chain.faucetClaimTx());
		const feedback = await state.chain.sendTransaction(tx);
		console.log(`Faucet claim txid : ${feedback[0]}`)
		await state.raptor.refresh();
		await state.chain.refresh();
		this.refreshOnce(true);
	}

	async addTestnetToMetamask() {
		// Delegate to Wallet so the request is routed through the connected
		// provider (providerRequest) instead of the global window.ethereum,
		// which may belong to a different wallet extension.
		const wallet = this.readState().wallet || new Wallet();
		await wallet.addTestnetToMetamask();
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;
		const tokenBalance = (!!state.raptor) ? state.raptor.balancev3 : 0;
		const coinBalance = (!!state.chain) ? state.chain.balance : 0;

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
						<h2>Balance</h2>
						<AnimatedNumber
							value={numeral(coinBalance || 0).format('0.00')}
							duration="1000"
							formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
							// className="staking-info"
						>
							0 Raptor
						</AnimatedNumber>
						<button id="btn-deposit" className="btn btn-primary btn-md link-dark align-self-center stake-confirm" onClick={this.claim}>Claim 1000 testnet RPTR</button>
						<button id="btn-addtometa" className="btn btn-complementary btn-md link-dark align-self-center stake-claim" onClick={this.addTestnetToMetamask}>Add Testnet to metamask</button>
					</div>


				</FadeInLeftDiv>

				<div className="migration-footer">
					<font size="2"><i>Note : These RPTR are test coins and don't have a monetary value !</i></font>
				</div>



			</div>
		</div>
	}
}

export default withTranslation()(TestnetFaucetComponent);