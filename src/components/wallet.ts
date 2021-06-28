import Web3 from 'web3';
import Web3Modal, { providers } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Contract } from 'web3-eth-contract';

export class Wallet {
	private _address: string = null;
	private _provider: any = null;
	private web3Modal = new Web3Modal({
		network: "binance", // TODO: change this network option to be changable according
		cacheProvider: false,
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

	public async connect(): Promise<boolean> {
		const wnd: any = window;
		this._provider = await this.web3Modal.connect();

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

		const provider: any = this._web3.eth.currentProvider;
		if (!provider || ((provider.chainId != 56) && (provider.networkVersion != 56))) {
			if (provider.isMetaMask) {
				const networkinfo = [{
					chainId: '0x38',
					chainName: 'Binance Smart Chain',
					nativeCurrency:
					{
						name: 'BNB',
						symbol: 'BNB',
						decimals: 18
					},
					rpcUrls: ['https://bsc-dataseed1.binance.org/'],
					blockExplorerUrls: ['https://bscscan.com/'],
				}]
				await ethereum.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () { throw 'Please choose the Binance Smart Chain as the current network in your wallet app !' })
			}
			else {
				throw 'Please choose the Binance Smart Chain as the current network in your wallet app !';
			}
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

			// If the cached provider is not cleared,
			// WalletConnect will default to the existing session
			// and does not allow to re-scan the QR code with a new wallet.
			// Depending on your use case you may want or want not his behavir.
			await this.web3Modal.clearCachedProvider();
			this._provider = null;
		}
		return this.isConnected;
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
}
