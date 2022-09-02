import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const DeployerAddress = "0x54Aeeb4fEfF57d5944C859bb66d5FeAFBf01F982";

export class YourTokenBackend {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private _balance: number = 0;
	private _deployed: Contract;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		if (this._wallet.chainId != 1380996178) {
			this._wallet.addMainnetToMetamask();
		}
		if (this._wallet.chainId == 1380996178) {
			this._contract = this._wallet.connectToContract(DeployerAddress, require('./yourtoken.abi.json'));
		}
		else {
			throw "Wrong network !"
		}
	}
	
	async deploy(name: string, symbol: string, supply: number) {
		await this._contract.methods.deploy(name, symbol, web3.toWei(String(supply)), "18").send({'from': this._wallet.currentAddress});
		return (await this._contract.methods.lastTokenByUser(this._wallet.currentAddress));
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
