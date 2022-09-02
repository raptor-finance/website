import Web3 from 'web3';
import Web3Modal, { providers } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Contract } from 'web3-eth-contract';

export class Wallet {
	private _address: string = null;
	private _provider: any = null;
	private _raptorChainID: number = 499597202514;
	private _chainId: number = 0;
	private web3Modal = new Web3Modal({
		network: "binance", // TODO: change this network option to be changable according
		cacheProvider: true,
		providerOptions: this.getProviderOptions()
	});
	private _web3: Web3 = null;

	public getProviderOptions(): any {
		const providerOptions = {
			walletconnect: {
				package: WalletConnectProvider,
				options: {
					rpc: {
						56: 'https://bsc-dataseed.binance.org/'
					},
					network: 'binance',
					chainId: 56,
					infuraId: 'TR4KMIQ72NEDFNJ2ZP5C1BGGTD6DSTTGGT'
				}
				// ,options: {
				// 	rpc: {
				// 		97: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
				// 	},
				// 	network: 'binance',
				// 	chainId: 97,
				// 	infuraId: 'TR4KMIQ72NEDFNJ2ZP5C1BGGTD6DSTTGGT '
				// }
			}
		};

		return providerOptions;
	};

	public async addMainnetToMetamask() {
		const networkinfo = [{
			chainId: '0x52505452',
			chainName: 'RaptorChain Mainnet Beta',
			nativeCurrency:
			{
				name: 'Raptor',
				symbol: 'RPTR',
				decimals: 18
			},
			rpcUrls: ['https://rpc.raptorchain.io/web3'],
			blockExplorerUrls: ["https://explorer.raptorchain.io/"],
		}]
		try {
			await this._provider.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () { throw 'Failed adding RaptorChain Testnet to metamask' })
		} catch (e) {
			throw "Failed to add mainnet to metamask !"
		}
	}
	
	async switchNetwork(chainID: number) {
		const networks = {56 : [{
			chainId: '0x38',
			chainName: 'Binance Smart Chain',
			nativeCurrency:
			{
				name: 'BNB',
				symbol: 'BNB',
				decimals: 18
			},
			rpcUrls: ['https://bsc-dataseed3.binance.org/'],
			blockExplorerUrls: ['https://bscscan.com/'],
			}], 97 : [{
				chainId: '0x61',
				chainName: 'Binance Smart Chain Testnet',
				nativeCurrency:
				{
					name: 'tBNB',
					symbol: 'tBNB',
					decimals: 18
				},
				rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
				blockExplorerUrls: ['https://testnet.bscscan.com/'],
			}], 1380996178 : [{
				chainId: '0x52505452',
				chainName: 'RaptorChain',
				nativeCurrency:
				{
					name: 'RPTR',
					symbol: 'RPTR',
					decimals: 18
				},
				rpcUrls: ['https://rpc.raptorchain.io/'],
				blockExplorerUrls: ['https://explorer.raptorchain.io/'],
			}], 499597202514 : [{
				chainId: '0x7452505452',
				chainName: 'RaptorChain Testnet',
				nativeCurrency:
				{
					name: 'tRPTR',
					symbol: 'tRPTR',
					decimals: 18
				},
				rpcUrls: ['https://rpc-testnet.raptorchain.io/'],
				blockExplorerUrls: ['https://explorer-testnet.raptorchain.io/'],
			}]
		}
		if (this._provider.isMetaMask) {
			await ethereum.request({ method: 'wallet_addEthereumChain', params: networks[chainID] }).catch(function () { throw 'Please choose the Binance Smart Chain as the current network in your wallet app !' })
		}
		else {
			throw 'Please choose the Binance Smart Chain as the current network in your wallet app !';
		}
	}

	public async connect(expectedChainID: number): Promise<boolean> {
		console.log(`expectedChainID value : ${expectedChainID || 56}`);
		const wnd: any = window;
		try {
			this._provider = await this.web3Modal.connect();
		} catch (e) {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}

		// Subscribe to provider disconnection
		this._provider.on("disconnect", async (error: { code: number; message: string }) => {
			this._web3 = null;
			this._address = null;
			console.log(error);
		});
		// if (!!wnd.ethereum) {
		if (!this._web3) {
			this._web3 = new Web3(this._provider);
		}

		const accounts = await this._web3.eth.getAccounts();
		const selectedAccount = accounts[0];

		const provider: any = this._provider;
		if (provider) {
			this._chainId = provider.chainId;
			// if (!ignoreChain && ((provider.chainId != 1380996178) && (provider.networkVersion != 1380996178)) && ((provider.chainId != 56) && (provider.networkVersion != 56)) && ((provider.chainId != this._raptorChainID) && (provider.networkVersion != this._raptorChainID)) && ((provider.chainId != 97) && (provider.networkVersion != 97))) {
			if ((expectedChainID || 56) != provider.chainId) {
				this.switchNetwork(expectedChainID || 56);
			}
		}
		else {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}

		this._address = selectedAccount;
		return this.isConnected;
		// }
		// else {
		// 	// throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		// }
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
		return this._provider.chainId;
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
	
	public async sign(strdata: string): string {
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
	
	public get chainId(): number {
		return this._chainId;
	}
}