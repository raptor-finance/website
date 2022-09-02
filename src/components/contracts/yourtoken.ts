import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const DeployerAddress = "";

export class YourTokenBackend {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private _balance: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		if (this._wallet.chainId != 1380996178) {
			this._wallet.addMainnetToMetamask();
		}
		if (this._wallet.chainId == 1380996178) {
			this._contract = this._wallet.connectToContract(DeployerAddress, require('./yourtoken.abi.json'));
			this._balance = web3.fromWei(String(await this._wallet.eth_getBalance(this._wallet.currentAddress)));
		}
		else {
			throw "Wrong network !"
		}
	}

	get contract(): Contract {
		return this._contract;
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get balance(): number {
		return this._balance;
	}

	async refresh(): Promise<void> {
		try {
			if (this._wallet.chainId == 1380996178) {
				this._balance = web3.fromWei(String(await this._wallet.eth_getBalance(this._wallet.currentAddress)));
			}
		}
		catch (e) {
			throw e;
		}
	}
}
