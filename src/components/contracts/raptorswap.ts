import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

export const FactoryAddress = "0xB8F7aAdaC20Cd74237dDAB7AC7ead317BF049Fa3";
export const RouterAddress = "0x397D194abF71094247057642003EaCd463b7931f";
export const WRPTRAddress = "0xeF7cADE66695f4cD8a535f7916fBF659936818C4";

export class RaptorSwap {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
	}
	
	calcName(tokenName) {
		return ((tokenName == "RPTR") ? WRPTRAddress : tokenName);
	}
	
	getPath(tokenA, tokenB) {
		let _path = [];
		const _tokenA = this.calcName(tokenA)
		const _tokenB = this.calcName(tokenB)
		if (_tokenA == _tokenB) {
			throw "Same token";
		}
		_path.push(_tokenA);
		_path.push(_tokenB);
		return _path;
	}
	
	getTradeType(tokenA, tokenB) {
		// type 0 = RPTR to token
		// type 1 = token to RPTR
		// type 2 = token to token
		return (tokenA == "RPTR")?0: ((tokenB == "RPTR")? 1: 2);
	}
	
	async getAmountOut(amountIn, path) {
		return 0;
	}
	
	async getAmountIn(expectedAmountOut, path) {
		return 0;
	}
	
	async swapTokenToToken(amountIn, path) {
		return 0;
	}
	
	async swapTokenToRPTR(amountIn, path) {
		return 0;
	}

	async swapRPTRToToken(amountIn, path) {
		return 0;
	}
	
	async swap(amountIn, assetFrom, assetTo) {
		const _tType = this.getTradeType(assetFrom, assetTo);
		const _path = this.getPath(assetFrom, assetTo);
		switch (_tType) {
			case 0:
				await swapRPTRToToken(amountIn, _path);
			case 1:
				await swapTokenToRPTR(amountIn, _path);
			case 2:
				await swapTokenToToken(amountIn, _path);
		}
	}
	
	async getOutput(amountIn, assetFrom, assetTo) {
		const _path = this.getPath(assetFrom, assetTo);
		return (await this.getAmountOut(amountIn, _path));
	}
	
	async getInput(expectedAmountOut, assetFrom, assetTo) {
		const _path = this.getPath(assetFrom, assetTo);
		return (await this.getAmountIn(expectedAmountOut, _path));
	}
}