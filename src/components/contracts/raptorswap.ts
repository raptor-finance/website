import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

export const FactoryAddress = "0xB8F7aAdaC20Cd74237dDAB7AC7ead317BF049Fa3";
export const RouterAddress = "0x397D194abF71094247057642003EaCd463b7931f";
export const WRPTRAddress = "0xeF7cADE66695f4cD8a535f7916fBF659936818C4";

export const EVM_MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export class RaptorSwap {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;
	private readonly _factory: Contract;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._factory = wallet.connectToContract(FactoryAddress, require('./swapfactory.abi.json'))
		this._router = wallet.connectToContract(RouterAddress, require('./swaprouter.abi.json'))
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
	
	async ensureApproval(tokenAddr, rawAmount) {
		const _token = this._wallet.connectToContract(tokenAddr, require("./erc20.abi.json"));
		const _currentAllowance = _token.methods.allowance(this._wallet.currentAddress, RouterAddress);
		if (rawAmount > _currentAllowance) {
			_token.methods.approve(RouterAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress});
		}
	}
	
	async getAmountOut(amountIn, path) {
		const amts = await this._router.methods.getAmountsOut(amountIn, path).call();
		return amts[amts.length-1];
	}
	
	async getAmountIn(expectedAmountOut, path) {
		return 0;
	}
	
	async swapTokenToToken(amountIn, path) {
		ensureApproval(path[0], amountIn);
		return 0;
	}
	
	async swapTokenToRPTR(amountIn, path) {
		ensureApproval(path[0], amountIn);
		return 0;
	}

	async swapRPTRToToken(amountIn, path) {
		return (await this._router.methods.swapExactETHForTokens(0, path, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "value": amountIn, "gas": 500000}));
	}
	
	async swap(_amountIn, assetFrom, assetTo) {
		const amountIn = web3.toWei(_amountIn);
		const _tType = this.getTradeType(assetFrom, assetTo);
		const _path = this.getPath(assetFrom, assetTo);
		switch (_tType) {
			case 0:
				await this.swapRPTRToToken(amountIn, _path);
			case 1:
				await this.swapTokenToRPTR(amountIn, _path);
			case 2:
				await this.swapTokenToToken(amountIn, _path);
		}
	}
	
	async getOutput(amountIn, assetFrom, assetTo) {
		const _amountIn = web3.toWei(amountIn);
		try {
			const _path = this.getPath(assetFrom, assetTo);
			return web3.fromWei(await this.getAmountOut(_amountIn, _path));
		} catch (e) {
			console.error(e);
			return 0;
		}
	}
	
	async getInput(expectedAmountOut, assetFrom, assetTo) {
		const _expectedAmountOut = web3.toWei(expectedAmountOut);
		try {
			const _path = this.getPath(assetFrom, assetTo);
			return web3.fromWei(await this.getAmountIn(_expectedAmountOut, _path));
		} catch (e) {
			console.error(e);
			return 0;
		}
	}
}