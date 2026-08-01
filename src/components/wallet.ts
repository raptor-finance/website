import Web3 from 'web3';
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { Contract } from 'web3-eth-contract';
import * as web3 from 'web3-utils';

import {
	CHAIN,
	CHAIN_HEX,
	CHAIN_META,
	RPC,
	RPTR_TOKEN,
} from '../config';

/** RPTR token address per chain. */
export const Raptors = RPTR_TOKEN;
export const ChainNames = {56: "BSC", 137: "Polygon", 250: "Fantom"};
export const ChainIDsToRefresh = [56, 137, 250];

/**
 * Onboard chains, one per chain in the central config.
 *
 * `id` is the decimal chain id: Web3-Onboard converts it to the hex form
 * used by wallet_addEthereumChain / wallet_switchEthereumChain automatically.
 */
function buildOnboardChains() {
	const chains = [];
	for (const chainId of Object.keys(CHAIN_META)) {
		const meta = CHAIN_META[chainId];
		chains.push({
			id: Number(chainId),
			token: meta.nativeCurrency.symbol,
			label: meta.chainName,
			rpcUrl: meta.rpcUrls[0],
		});
	}
	return chains;
}

/**
 * Single shared Web3-Onboard instance.
 *
 * Onboard keeps its own (localStorage-backed) wallet cache, so reconnecting
 * on later pages re-uses the previously connected wallet instead of showing
 * the wallet modal again. The injected wallet module is EIP-6963 aware, so it
 * discovers the *real* MetaMask (or whatever injected wallet the user has)
 * instead of blindly talking to `window.ethereum`.
 */
const onboard: OnboardAPI = Onboard({
	wallets: [injectedModule()],
	chains: buildOnboardChains(),
	appMetadata: {
		name: 'Raptor Finance',
		icon: 'https://raptorswap.com/images/logo.png',
		description: 'Raptor Finance dApp',
		recommendedInjectedWallets: [
			{ name: 'MetaMask', url: 'https://metamask.io' },
		],
	},
	accountCenter: {
		desktop: { enabled: false },
		mobile: { enabled: false },
	},
	notify: {
		desktop: { enabled: false },
		mobile: { enabled: false },
	},
});

export class ReadOnlyProvider {
	private _web3: Web3 = null;
	private _rptrToken: Contract;
	private chainId: number;
	private _userAddr: string;
	private _rptrBalance: string = "0";
	
	constructor(rpcURL: string, _chainId: number, userAddr: any) {
		this._userAddr = userAddr;
		this._web3 = new Web3((new Web3.providers.HttpProvider(rpcURL)));
		this.chainId = _chainId;
		if (_chainId != CHAIN.RAPTORCHAIN) {
			this._rptrToken = this.connectToContract(Raptors[_chainId], require('./contracts/erc20.abi.json'));
		}
	}
	
	changeUserAddr(_addr) {
		this._userAddr = _addr;
	}
	
	public connectToContract(address: string, abi: any): Contract {
		if (!this._web3) {
			throw 'Error loading contract';
		}
		return new this._web3.eth.Contract(abi, address);
	}
	
	public async eth_getBalance(address) {
		if (!this._web3) {
			return 0;
		}
		return (await this._web3.eth.getBalance(address));
	}
	
	public async getRaptorBalance(address) {
		return (this.chainId == CHAIN.RAPTORCHAIN) ? (await this.eth_getBalance(address)) : (this._rptrToken.methods.balanceOf(address).call());
	}
	
	public async refresh() {
		if (!this._userAddr) {
			return;
		}
		this._rptrBalance = String(await this.getRaptorBalance(this._userAddr));
	}
	
	public get balance() {
		return Number(web3.fromWei(this._rptrBalance));
	}
}

export class Wallet {
	private _address: string = null;
	private _provider: any = null;
	private _raptorChainID: number = CHAIN.RAPTORCHAIN_TESTNET;
	private _web3: Web3 = null;
	private _readOnlyProvs: any = {};

	/**
	 * EIP-3085 network params, one per chain id, built from the central config.
	 * Used by wallet_addEthereumChain when a wallet does not know the chain yet.
	 */
	private networks: Object = Object.keys(CHAIN_META).reduce((acc, chainId) => {
		acc[chainId] = [{ chainId: CHAIN_HEX[chainId], ...CHAIN_META[chainId] }];
		return acc;
	}, {});

	/**
	 * Send a JSON-RPC request to the currently connected wallet provider.
	 * Falls back to `window.ethereum` when no wallet is connected yet (used by
	 * "Add to MetaMask" flows). Using the connected provider matters when
	 * several wallet extensions are installed: it targets the wallet the user
	 * actually connected with, not whichever extension won `window.ethereum`.
	 */
	private async providerRequest(method: string, params: any[]): Promise<any> {
		const provider: any = this._provider || ((window as any).ethereum || null);
		if (!provider || !provider.request) {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}
		return await provider.request({ method: method, params: params });
	}

	public async addMainnetToMetamask() {
		const networkinfo = [{
			chainId: CHAIN_HEX[CHAIN.RAPTORCHAIN],
			chainName: 'RaptorChain Mainnet Beta',
			nativeCurrency:
			{
				name: 'Raptor',
				symbol: 'RPTR',
				decimals: 18
			},
			rpcUrls: [RPC[CHAIN.RAPTORCHAIN]],
			blockExplorerUrls: [CHAIN_META[CHAIN.RAPTORCHAIN].blockExplorerUrls[0]],
		}]
		try {
			await this.providerRequest('wallet_addEthereumChain', networkinfo).catch(function () { throw 'Failed adding RaptorChain to metamask' })
		} catch (e) {
			throw "Failed to add mainnet to metamask !"
		}
	}
	
	public async switchNetwork(chainID: number) {
		if (this.chainId == chainID) {
			return;
		}
		const ok = await onboard.setChain({ chainId: String(chainID) });
		if (!ok) {
			throw 'Please choose the right network in your wallet app !';
		}
	}

	public async addTokenToMetamask(address: string, symbol: string, decimals: number, image?: string) {
		await this.providerRequest('wallet_watchAsset', [{
			type: 'ERC20',
			options: {
				address: address,
				symbol: symbol,
				decimals: decimals,
				image: image,
			}
		}]);
	}
	
	public getReadOnly(chainID: number) {
		if (this._readOnlyProvs[chainID]) {
			return this._readOnlyProvs[chainID];
		}
		this._readOnlyProvs[chainID] = (new ReadOnlyProvider(CHAIN_META[chainID].rpcUrls[0], chainID, this._address));
		return this._readOnlyProvs[chainID];
	}

	/**
	 * Reconnect to the previously used wallet without showing the wallet modal.
	 * Returns true when a wallet session exists and the wallet accepted the
	 * silent reconnect.
	 */
	private async tryReconnect(): Promise<boolean> {
		const previouslyConnected = (await onboard.state.get().wallets) || [];
		if (previouslyConnected.length === 0) {
			return false;
		}
		try {
			const wallets = await onboard.connectWallet({
				autoSelect: {
					label: previouslyConnected[0].label,
					disableModals: true,
				}
			});
			return (wallets && wallets.length > 0);
		} catch (e) {
			console.warn('Wallet reconnect failed', e);
			return false;
		}
	}

	public async connect(expectedChainID: number): Promise<boolean> {
		console.log(`expectedChainID value : ${expectedChainID}`);
		try {
			let wallets: any[] = null;
			if (expectedChainID === 0) {
				// "any chain" mode (crosschain mainnet): try to silently
				// reconnect to the last used wallet before opening the modal.
				wallets = (await this.tryReconnect()) ? await onboard.state.get().wallets : await onboard.connectWallet();
			}
			else {
				wallets = await onboard.connectWallet();
			}

			if (!wallets || wallets.length === 0) {
				throw 'The wallet connection was cancelled.';
			}

			const connected = wallets[0];
			this._provider = connected.provider;
			this._address = (connected.accounts && connected.accounts.length > 0) ? connected.accounts[0].address : null;
			if (!this._web3) {
				this._web3 = new Web3(this._provider);
			}

			// Subscribe to provider disconnection
			this._provider.on("disconnect", async (error: { code: number; message: string }) => {
				console.log(error);
			});
			this._provider.on('accountsChanged', (accounts: string[]) => {
				this._address = (accounts && accounts.length > 0) ? accounts[0] : null;
			});

			const requestedChain = expectedChainID || CHAIN.BSC;
			if (expectedChainID != 0 && requestedChain != this.chainId) {
				await this.switchNetwork(requestedChain);
			}
		} catch (e) {
			if (typeof e === 'string' && e === 'The wallet connection was cancelled.') {
				throw e;
			}
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}

		return this.isConnected;
	}

	public async disconnect(): Promise<boolean> {
		const state = onboard.state.get();
		for (const connectedWallet of state.wallets) {
			await onboard.disconnectWallet({ label: connectedWallet.label });
		}
		this._web3 = null;
		this._address = null;
		this._provider = null;
		return this.isConnected;
	}

	public get chainId(): number {
		if (this._provider && this._provider.getChainId) {
			return Number(this._provider.getChainId());
		} else if (this._provider && this._provider.chainId) {
			// MetaMask returns a hex string (0x38), WalletConnect a decimal number
			return Number(this._provider.chainId);
		}
		return null;
	}


	public get isConnected(): boolean {
		return !!this._address;
	}
	
	public get currentAddress(): string {
		return this._address;
	}

	public connectToContract(address: string, abi: any): Contract {
		if (!this._web3) {
			throw 'Wallet is not connected';
		}

		return new this._web3.eth.Contract(abi, address);
	}
	
	public async sign(strdata: string): Promise<string> {
		if (!this._web3) {
			throw 'Wallet is not connected';
		}
		return (await this._web3.eth.personal.sign(strdata, this._address));
	}
	
	public async eth_getBalance(address) {
		if (!this._web3) {
			return 0;
		}
		return (await this._web3.eth.getBalance(address));
	}
	
	public get raptorChainID(): number {
		return this._raptorChainID;
	}
}
