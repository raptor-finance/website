import * as React from 'react';

import { Container, Row } from 'react-bootstrap';
import { Trans } from 'react-i18next';

import { Wallet } from '../wallet';
import { RaptorFarmNew } from '../contracts/raptorfarmnew';
import { WalletPageBase, WalletPageState } from './WalletPageBase';
import { FarmCard, FarmCardProps } from './FarmCard';
import WalletConnectButton from './WalletConnectButton';

import '../pages/paddings.css';
import '../pages/farm/farmComponent.css';

export type FarmPool = {
	apr: number;
	lpBalance: number;
	stakedLp: number;
	rewards: number;
	tvl: number;
	usdavailable: number;
	usdstaked: number;
	usdrewards: number;
	[prop: string]: any;
};

export type FarmPageState = WalletPageState & {
	farm?: { [pid: string]: any };
	ctValue?: { [key: string]: string };
};

export type FarmPageProps = {
	[key: string]: any;
};

/**
 * The farm / staking page.
 *
 * farmComponent.tsx, stakingComponent.tsx (and their deprecated v2 twins)
 * were ~90% identical: same pool-list build, same polling loop, same card
 * grid. This component centralizes the pool lifecycle; subclasses only supply
 * the static config (title, farm list, translations) via `pageConfig`.
 */
export class FarmPage extends WalletPageBase<FarmPageProps, FarmPageState> {

	/** Resolves once the farm pool list has been built and committed to state. */
	private _farmReady: Promise<void>;
	/** Resolver for _farmReady, called once pools are in state. */
	private _resolveFarmReady: () => void;

	constructor(props: any) {
		super(props);

		this.depositLP = this.depositLP.bind(this);
		this.withdrawLP = this.withdrawLP.bind(this);
		this.claimRaptor = this.claimRaptor.bind(this);
		this.stakingValueChanged = this.stakingValueChanged.bind(this);

		this.state = ({} as FarmPageState);

		// Always defined so connectWallet() can await it even if a user clicks
		// before componentDidMount finishes building the farm list.
		this._farmReady = new Promise<void>((resolve) => {
			this._resolveFarmReady = resolve;
		});
	}

	protected get pollIntervalMs(): number {
		return this.pageConfig.pollIntervalMs || 10000;
	}

	protected get connectChainId(): number {
		return this.pageConfig.connectChainId || 56;
	}

	protected get poolFactory(): (pid: number) => any {
		return this.pageConfig.poolFactory || ((pid: number) => new RaptorFarmNew(pid));
	}

	/**
	 * Static page configuration (title, farm list, translations...). Subclasses
	 * override this to supply their page's config; FarmPage reads it for the
	 * shared behaviour (polling interval, connect chain, pool factory, ...).
	 */
	protected get pageConfig(): { [key: string]: any } {
		return {};
	}

	/**
	 * Build the farm pool list. The default implementation (used by the v3 farm
	 * and staking pages) builds all pools before the wallet connects and stores
	 * them under the "1," key namespace. The deprecated v2 farm builds its pools
	 * after wallet connect (RaptorFarm requires a wallet) under "0,".
	 */
	protected async buildFarm(): Promise<{ [pid: string]: any }> {
		let farm: any = {};
		farm[`1,0`] = this.poolFactory(0);
		await farm[`1,0`]._setupFinished;
		await farm[`1,0`].refresh();

		const poolLengthNew = (await farm[`1,0`].contractView.methods.poolLength().call());
		var i = 1;
		while (i < poolLengthNew) {
			let f = this.poolFactory(i);
			farm[`1,${i}`] = f;
			await f._setupFinished;
			i += 1;
		}
		return farm;
	}

	async componentDidMount() {
		await this.updateState({ pending: true });
		const farm = await this.buildFarm();

		// Only publish a pre-built farm list when there is one. Pages whose
		// pools require a wallet (v2 farm) build them later in buildSession();
		// publishing an empty farm here would make the first refreshOnce tick
		// read farm["0,0"] as undefined and log spurious warnings.
		if (farm && Object.keys(farm).length > 0) {
			// Signal that the farm list is ready, so connectWallet() can proceed.
			// Use setState's callback so _farmReady only resolves after React has
			// actually committed the farm to state (setState is async).
			(this as any).setState({ farm }, () => this._resolveFarmReady());
		} else {
			// Nothing to wait for; connectWallet() can proceed immediately.
			this._resolveFarmReady();
		}

		super.componentDidMount();
		await this.updateState({ pending: false });
	}

	protected async buildSession(wallet: Wallet): Promise<void> {
		// The farm list is built asynchronously in componentDidMount (multiple
		// RPC calls). Wait for it before touching state.farm, otherwise a user
		// click (or the mount-time auto-connect) can race ahead of farm setup
		// and crash on farm["1,0"] being undefined.
		await this._farmReady;

		const state = this.readState();
		const farm = state.farm;
		const poolLengthNew = (await farm[`1,0`].contractView.methods.poolLength().call());

		for (let i = 0; i < poolLengthNew; i++) {
			farm[`1,${i}`].connectWallet(wallet);
			await farm[`1,${i}`].refresh();
		}

		this.updateState({ wallet: wallet, looping: true });
	}

	protected async refreshOnce(resetCt?: boolean): Promise<boolean> {
		const state = this.readState();
		const farm = state.farm;
		if (!!farm) {
			try {
				// The pool list lives under a version key namespace: "1," for the
				// v3 farm/staking pools, "0," for the deprecated v2 farm.
				const version = this.pageConfig.farmVersion || '1';
				const poolLengthNew = (await farm[`${version},0`].contract.methods.poolLength().call());
				for (let j = 0; j < poolLengthNew - 1; j++) {
					farm[`${version},${j}`].refresh();
				}

				await farm[`${version},${poolLengthNew - 1}`].refresh();

				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: state.wallet ? state.wallet.currentAddress : undefined,
				});

				if (resetCt) {
					this.updateState({
						address: "",
					});
				}
			}
			catch (e) {
				console.warn('Unable to update farm status', e);
			}
		} else {
			return false;
		}

		return true;
	}

	protected resetState(): void {
		this.updateState({ farm: null });
	}

	getAmounts(version: number, pid: number): FarmPool | undefined {
		const farminfo = ((this.readState().farm || {})[`${version},${pid}`]);
		if (farminfo == undefined) {
			return undefined;
		}
		return {
			apr: farminfo.apr,
			lpBalance: farminfo.lpBalance,
			stakedLp: farminfo.stakedLp,
			rewards: farminfo.rewards,
			tvl: farminfo.tvl,
			usdavailable: farminfo.usdavailable,
			usdstaked: farminfo.usdstaked,
			usdrewards: farminfo.usdrewards,
		};
	}

	async depositLP(version: number, pid: number): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });
			const amount = Number(state.ctValue[`${version},${pid}`]);
			if (amount >= 0) {
				await state.farm[`${version},${pid}`].deposit(amount);
			} else {
				throw "Can't deposit a negative amount.";
			}

			this.updateState({ pending: false });
			this.refreshOnce(false).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async withdrawLP(version: number, pid: number): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });
			const amount = Number(state.ctValue[`${version},${pid}`]);
			if (amount >= 0) {
				await state.farm[`${version},${pid}`].withdraw(amount);
			} else {
				throw "Can't withdraw a negative amount.";
			}

			this.updateState({ pending: false });
			this.refreshOnce(false).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async claimRaptor(version: number, pid: number): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });
			await state.farm[`${version},${pid}`].claim();

			this.updateState({ pending: false });
			this.refreshOnce(false).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	stakingValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		const _ctValue = (this.readState().ctValue || {});

		_ctValue[event.target.id] = event.target.value;

		this.updateState({
			ctValue: _ctValue,
		});
	}

	renderCard(farm: any, i: number): React.ReactNode {
		const cfg = this.pageConfig;
		const props: FarmCardProps = {
			logo: farm.logo,
			pairName: farm.pairName,
			fees: farm.fees,
			liquidityPool: farm.liquidityPool,
			enableGlow: farm.enableGlow,
			pid: farm.pid,
			version: farm.version,
			addLiquidityURL: farm.addLiquidityURL,
			showLP: cfg.showLP !== false,
			showTVL: cfg.showTVL !== false,
			showAd: cfg.showAd !== false,
			amounts: (() => {
				const out: any = {};
				out[`${farm.version},${farm.pid}`] = this.getAmounts(farm.version, farm.pid);
				return out;
			})(),
			ctValue: this.readState().ctValue,
			onAmountChange: this.stakingValueChanged,
			onDeposit: this.depositLP,
			onWithdraw: this.withdrawLP,
			onClaim: this.claimRaptor,
		};
		return <FarmCard key={i} {...props} />;
	}

	render() {
		const state = this.readState();
		const t: any = this.readProps().t;
		const cfg = this.pageConfig;
		const {
			title,
			titleSuffix,
			paragraphKey,
			transKey,
			farmsList,
		} = cfg;

		return (
			<div className="farm-container">
				<div className="row text-white farm-header">
					<div className="col-md-12">
						<div className="farm-title">
							<span>Raptor</span>
							<span style={{ color: "#31c461" }}>{title}</span>
							{titleSuffix && <span> {titleSuffix}</span>}
							<WalletConnectButton
								connected={!!state.address}
								pending={state.pending}
								onConnect={this.connectWallet}
								onDisconnect={this.disconnectWallet}
							/>
						</div>

						<p>{t(paragraphKey)}</p>
						<p>
							<Trans i18nKey={transKey}>In order to farm with LP tokens, you need to connect your browser wallet (such as <a
								href="https://metamask.io/">Metamask</a>) and <a
									href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain"
									target="_blank">Switch to the Binance Smart Chain</a></Trans>.
						</p>
					</div>
				</div>

				<Container className="farm-body">
					<Row>
						{(farmsList || []).map((farm, i) => this.renderCard(farm, i))}
					</Row>
				</Container>
			</div>
		);
	}
}
