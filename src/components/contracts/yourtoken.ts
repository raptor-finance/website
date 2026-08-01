import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

import { CHAIN, CONTRACTS } from '../../config';
import { fromRawUnits } from '../../utils/units';

export const DeployerAddress = CONTRACTS.YOUR_TOKEN_DEPLOYER;

export class YourTokenBackend {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private _balance: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		if (this._wallet.chainId != CHAIN.RAPTORCHAIN) {
			this._wallet.addMainnetToMetamask();
		}
		if (this._wallet.chainId == CHAIN.RAPTORCHAIN) {
			this._contract = this._wallet.connectToContract(DeployerAddress, require('./yourtoken.abi.json'));
		}
		else {
			throw "Wrong network !"
		}
	}
	
	async deploy(name: string, symbol: string, supply: number) {
		await this._contract.methods.deploy(name, symbol, web3.toWei(String(supply)), "18").send({'from': this._wallet.currentAddress});
		const addr = (await this._contract.methods.lastTokenByUser(this._wallet.currentAddress).call());
		console.log(addr);
		return addr;
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
		if (!this._wallet) {
			return;
		}
		if (this._wallet.chainId == CHAIN.RAPTORCHAIN) {
			this._balance = fromRawUnits(await this._wallet.eth_getBalance(this._wallet.currentAddress));
		}
	}
}
