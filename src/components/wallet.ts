import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {Contract} from "web3-eth-contract";

export class Wallet {
	private _address: string = null;
	
	private  web3Modal = new Web3Modal({
		network: "mainnet", // TODO: change this network option to be changable according
		cacheProvider: false,
		providerOptions: this.getProviderOptions()
	  });
	private _web3: Web3 = null;

	public getProviderOptions (): any {
		const providerOptions = {
			walletconnect: {
				package: WalletConnectProvider,
				options: {
					infuraId: "14ac626894b04727a792316d48d56ffb"
					// infuraId: process.env.VUE_APP_INFURA_ID
				}
			}
		};
	
		return providerOptions;
	};

	

	public async connect(): Promise<boolean> {
		const wnd: any = window;
		const web3ModelProvider: any = await this.web3Modal.connect();

		// if (!!wnd.ethereum) {
			if (!this._web3) {
				this._web3 = new Web3(web3ModelProvider);
			}
			this._web3.eth.extend({
				methods: [
				  {
					name: "chainId",
					call: "eth_chainId",
					// outputFormatter: this._web3.utils.hexToNumber
				  }
				]
			});

			const accounts = await this._web3.eth.getAccounts();
			const selectedAccount = accounts[0];
			
			const provider: any = this._web3.eth.currentProvider;
			if (!provider || +provider.chainId !== 56) {
				throw 'Please choose the Binance Smart Chain as the current network in your wallet app.';
			}

			this._address = selectedAccount;
			return this.isConnected;
		// }
		// else {
		// 	// throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		// }
	}
	public async disconnect(): Promise<void> {
		this._web3 = null;
		this._address = null;
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
