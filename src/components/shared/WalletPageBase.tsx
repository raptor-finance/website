import { Component } from 'react';
import { Wallet } from '../wallet';
import { ShellErrorHandler } from '../shellInterfaces';

export type WalletPageState = {
	wallet?: Wallet;
	pending?: boolean;
	looping?: boolean;
	address?: string;
	[key: string]: any;
};

export type WalletPageProps = {
	[key: string]: any;
};

/**
 * Base class for wallet-backed pages.
 *
 * Every page used to copy-paste the same ~60 lines: connectWallet /
 * disconnectWallet / loop / updateOnce / componentDidMount auto-connect /
 * componentWillUnmount timer cleanup. That block now lives here once.
 *
 * Subclasses implement:
 *   - `buildSession()`: construct the domain objects and update state once the
 *     wallet is connected. Called from connectWallet() after the wallet is up.
 *   - `refreshOnce()`: one polling tick of the domain data (called by loop()).
 *   - Optionally override `pollIntervalMs` (default 10000) or `autoConnect`
 *     (default true).
 */
export abstract class WalletPageBase<
	TProps extends WalletPageProps,
	TState extends WalletPageState
> extends Component<TProps, TState> {

	protected _timeout: any = null;

	protected constructor(props: TProps) {
		super(props);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
	}

	/** Interval between polling ticks in ms. */
	protected get pollIntervalMs(): number {
		return 10000;
	}

	/** Chain id to request on connect (0 = leave the wallet on its current chain). */
	protected get connectChainId(): number {
		return 0;
	}

	/** Whether componentDidMount should auto-connect when a session exists. */
	protected get autoConnect(): boolean {
		return true;
	}

	protected readProps(): TProps {
		const self: any = this;
		return self.props || {};
	}

	protected readState(): TState {
		const self: any = this;
		return self.state || ({} as TState);
	}

	protected updateState(value: Partial<TState>): void {
		const self: any = this;
		self.setState(value);
	}

	protected handleError(error: any) {
		ShellErrorHandler.handle(error);
	}

	/**
	 * Connect the wallet and build the page's domain objects.
	 * Override to customize what gets created after a successful connect.
	 */
	protected async connectWallet(): Promise<void> {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect(this.connectChainId);

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			await this.buildSession(wallet);
			this.updateState({ wallet: wallet, pending: false });
			this.startLoop();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	/**
	 * Build the page-specific domain objects after a successful wallet connect
	 * (e.g. `new RaptorFarmNew(0)`, `new Raptor(wallet)`...) and update state.
	 */
	protected abstract buildSession(wallet: Wallet): Promise<void> | void;

	/** One polling tick. Return true to keep looping, false to stop. */
	protected abstract refreshOnce(resetCt?: boolean): Promise<boolean>;

	async disconnectWallet(): Promise<void> {
		try {
			this.updateState({ pending: true });
			const state = this.readState();
			if (!state.wallet) {
				return;
			}
			const result = await state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}

			this.updateState({ wallet: null, address: null, looping: false, pending: false });
			this.resetState();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	/** Called after a successful disconnect; subclasses reset their domain state here. */
	protected resetState(): void { }

	async componentDidMount() {
		if (this.autoConnect && (Wallet.hasCachedSession() || (window.ethereum || {}).selectedAddress)) {
			this.connectWallet();
		}
	}

	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		this.updateState({ looping: false });
	}

	protected startLoop(): void {
		const self = this;
		const cont = self.refreshOnce(false);
		cont.then(() => {
			// Always schedule the first re-tick. The initial refreshOnce may
			// legitimately return false because `looping: true` was just set via
			// setState (async commit) and isn't visible yet — mirroring the
			// original pages, where loop() was always kicked off after connect.
			// loop() re-checks refreshOnce's result + the looping flag.
			this._timeout = setTimeout(async () => await self.loop.call(self), this.pollIntervalMs);
		});
	}

	private async loop(): Promise<void> {
		const self = this;
		const cont = await self.refreshOnce.call(self, false);

		if (cont && this.readState().looping !== false) {
			this._timeout = setTimeout(async () => await self.loop.call(self), this.pollIntervalMs);
		}
	}
}
