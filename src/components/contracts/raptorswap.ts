import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';


export class RaptorSwap {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;

	constructor(wallet: Wallet, router) {
		this._wallet = wallet;
	}
}