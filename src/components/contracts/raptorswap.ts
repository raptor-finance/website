import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

export const FactoryAddress = "0xB8F7aAdaC20Cd74237dDAB7AC7ead317BF049Fa3";
export const RouterAddress = "0x397D194abF71094247057642003EaCd463b7931f";

export class RaptorSwap {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;

	constructor(wallet: Wallet, router) {
		this._wallet = wallet;
		t
	}
}