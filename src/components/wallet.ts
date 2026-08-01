import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Contract } from 'web3-eth-contract';
import * as web3 from 'web3-utils';

import {
	CHAIN,
	CHAIN_HEX,
	CHAIN_META,
	RPC,
	RPC_BY_CHAIN_ID,
	RPTR_TOKEN,
} from '../config';

/** RPTR token address per chain. */
export const Raptors = RPTR_TOKEN;
export const ChainNames = {56: "BSC", 137: "Polygon", 250: "Fantom"};
export const ChainIDsToRefresh = [56, 137, 250];

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
	private web3Modal = new Web3Modal({
		network: "binance", // TODO: change this network option to be changable according
		cacheProvider: true,
		providerOptions: this.getProviderOptions()
	});
	private _web3: Web3 = null;
	private _readOnlyProvs: any = {};

	/** EIP-3085 network params, one per chain id, built from the central config. */
	private networks: Object = Object.keys(CHAIN_META).reduce((acc, chainId) => {
		acc[chainId] = [{ chainId: CHAIN_HEX[chainId], ...CHAIN_META[chainId] }];
		return acc;
	}, {});

	public getProviderOptions(): any {
		return {
			walletconnect: {
				package: WalletConnectProvider,
				options: {
					rpc: RPC_BY_CHAIN_ID,
					network: 'binance',
					chainId: CHAIN.BSC,
					infuraId: 'TR4KMIQ72NEDFNJ2ZP5C1BGGTD6DSTTGGT'
				}
			}
		};
	};

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
			await this._provider.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () { throw 'Failed adding RaptorChain to metamask' })
		} catch (e) {
			throw "Failed to add mainnet to metamask !"
		}
	}
	
	public async switchNetwork(chainID: number) {
		if (this.chainId == chainID) {
			return;
		}
		await ethereum.request({ method: 'wallet_addEthereumChain', params: this.networks[chainID] }).catch(function () { throw 'Please choose the Binance Smart Chain as the current network in your wallet app !' })
	}
	
	public getReadOnly(chainID: number) {
		if (this._readOnlyProvs[chainID]) {
			return this._readOnlyProvs[chainID];
		}
		this._readOnlyProvs[chainID] = (new ReadOnlyProvider(CHAIN_META[chainID].rpcUrls[0], chainID, this._address));
		return this._readOnlyProvs[chainID];
	}

	public async connect(expectedChainID: number): Promise<boolean> {
		console.log(`expectedChainID value : ${expectedChainID}`);
		const wnd: any = window;
		try {
			this._provider = await this.web3Modal.connect();
		} catch (e) {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}

		// Subscribe to provider disconnection
		this._provider.on("disconnect", async (error: { code: number; message: string }) => {
			console.log(error);
		});
		if (!this._web3) {
			this._web3 = new Web3(this._provider);
		}

		const accounts = await this._web3.eth.getAccounts();
		const selectedAccount = accounts[0];

		const provider: any = this._provider;
		if (provider) {
			const requestedChain = expectedChainID || CHAIN.BSC;
			if (expectedChainID != 0 && requestedChain != provider.chainId) {
				await this.switchNetwork(requestedChain);
			}
		}
		else {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}

		this._address = selectedAccount;
		return this.isConnected;
	}

	public async disconnect(): Promise<boolean> {
		this._web3 = null;
		this._address = null;
		if (this._provider.close) {
			await this._provider.close();
		}
		// If the cached provider is not cleared,
		// WalletConnect will default to the existing session
		// and does not allow to re-scan the QR code with a new wallet.
		// Depending on your use case you may want or want not his behavir.
		await this.web3Modal.clearCachedProvider();
		this._provider = null;
		return this.isConnected;
	}

	public get chainId(): number {
		if (this._provider.getChainId) {
			return Number(this._provider.getChainId());
		} else if (this._provider.chainId) {
			return Number(this._provider.chainId);
		}
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
