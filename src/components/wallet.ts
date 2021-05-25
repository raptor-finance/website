import Web3 from "web3";
import {Contract} from "web3-eth-contract";

export class Wallet {
	private _address: string = null;
	private _web3: Web3 = null;

	public async connect(): Promise<boolean> {
		const wnd: any = window;

		if (!!wnd.ethereum) {
			if (!this._web3) {
				this._web3 = new Web3(wnd.ethereum);
			}

			const accounts = await wnd.ethereum.request({method:'eth_requestAccounts'});
			const selectedAccount = accounts[0];

			const provider: any = this._web3.eth.currentProvider;
			if (!provider || +provider.chainId !== 56) {
				throw 'Please choose the Binance Smart Chain as the current network in your wallet app.';
			}

			this._address = selectedAccount;
			return this.isConnected;
		}
		else {
			throw 'No compatible wallet app was found. Please install a supported browser extension, such as Metamask.';
		}
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
