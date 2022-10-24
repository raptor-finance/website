import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

export const FactoryAddress = "0xB8F7aAdaC20Cd74237dDAB7AC7ead317BF049Fa3";
export const RouterAddress = "0x397D194abF71094247057642003EaCd463b7931f";
export const WRPTRAddress = "0xeF7cADE66695f4cD8a535f7916fBF659936818C4";

// hashes used to for permit (liquidity withdrawal)
export const DOMAIN_SEPARATOR = "0xc56088e58ee9e64a22017a4611f12d8dee75fd43a2c6b273fa1fd813bfa29323";
export const PERMIT_TYPEHASH = "0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9";

export const EVM_MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export class LiquidityPair {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;
	private readonly _factory: Contract;
	private readonly _lp: Contract;
	
	private readonly _contract0: Contract;
	private readonly _contract1: Contract;
	
	token0: string; // token addresses
	token1: string;
	
	reserve0: BigInt; // total reserves
	reserve1: BigInt;
	
	balance0: BigInt; // user's pooled balances
	balance1: BigInt;
	
	ticker0: string;
	ticker1: string;
	
	totalSupply: BigInt; // total LP's supply
	lpbalance: BigInt; // user's LP balance
	
	formattedLpBalance: string;
	formattedBalance0: string;
	formattedBalance1: string;
	
	setupPromise: Promise;
	
	calcAddr(_contract) {
		return (_contract == WRPTRAddress) ? "RPTR" : _contract;
	}
	
	constructor(wallet: Wallet, router: Contract, factory: Contract, lpAddr: string) {
		this._wallet = wallet;
		this._router = router;
		this._factory = factory;
		this._lp = this._wallet.connectToContract(lpAddr, require("./lptoken.abi.json"));
		this.setupPromise = this.setupStuff();
	}
	
	async setupStuff() {
		this.token0 = await this._lp.methods.token0().call();
		this.token1 = await this._lp.methods.token1().call();
		this._contract0 = this._wallet.connectToContract(this.token0, require("./erc20.abi.json"));
		this._contract1 = this._wallet.connectToContract(this.token1, require("./erc20.abi.json"));
		
		this.token0 = this.calcAddr(this.token0);
		this.token1 = this.calcAddr(this.token1);
		
		this.ticker0 = (this.token0 == "RPTR") ? "RPTR" : (await this._contract0.methods.symbol().call());
		this.ticker1 = (this.token1 == "RPTR") ? "RPTR" : (await this._contract1.methods.symbol().call());
		
		await this.refresh();
	}
	
	async refresh() {
		const _r = await this._lp.methods.getReserves().call();
		this.reserve0 = BigInt(_r._reserve0);
		this.reserve1 = BigInt(_r._reserve1);
		this.totalSupply = BigInt(await this._lp.methods.totalSupply().call());
		
		this.lpbalance = BigInt(await this._lp.methods.balanceOf(this._wallet.currentAddress).call());
		
		this.balance0 = ((this.reserve0 * this.lpbalance) / this.totalSupply);
		this.balance1 = ((this.reserve1 * this.lpbalance) / this.totalSupply);
		
		this.formattedLpBalance = web3.fromWei(String(this.lpbalance));
		this.formattedBalance0 = web3.fromWei(String(this.balance0));
		this.formattedBalance1 = web3.fromWei(String(this.balance1));
	}
	
	public getOtherAmount(enteredAssetName, enteredAssetAmt) {
		const _enteredAssetAmt = BigInt(web3.toWei(enteredAssetAmt));
		let _enteredAssetReserve;
		let _otherAssetReserve;
		switch (this.calcAddr(enteredAssetName)) {
			case this.token0:
				_enteredAssetReserve = this.reserve0;
				_otherAssetReserve = this.reserve1;
				break;
			case this.token1:
				_enteredAssetReserve = this.reserve1;
				_otherAssetReserve = this.reserve0;
				break;
			default:
				throw "Asset not found in this pair";
		}
		const _amt = (_enteredAssetAmt * _otherAssetReserve) / _enteredAssetReserve;
		return web3.fromWei(String(_amt));
	}
}

export class RaptorSwap {
	private readonly _wallet: Wallet;
	private readonly _router: Contract;
	private readonly _factory: Contract;
	private _pairs: any;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._factory = wallet.connectToContract(FactoryAddress, require('./swapfactory.abi.json'));
		this._router = wallet.connectToContract(RouterAddress, require('./swaprouter.abi.json'));
		this._pairs = [];
		this.fetchPairs();
	}
	
	calcName(tokenName) {
		return ((tokenName == "RPTR") ? WRPTRAddress : tokenName);
	}
	
	public get pairs() {
		return (this._pairs ? this._pairs : []);
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
	
	getTokenAt(tokenAddr) {
		return this._wallet.connectToContract(tokenAddr, require("./erc20.abi.json"));
	}
	
	getLpAt(lpAddr) {
		return (new LiquidityPair(this._wallet, this._router, this._factory, lpAddr));
	}
	
	async fetchPairs() {
		let _p = [];
		const _l = await this._factory.methods.allPairsLength().call();
		for (let i = 0; i < _l; i++) {
			let _pAddr = await this._factory.methods.allPairs(i).call()
			_p.push(this.getLpAt(_pAddr));
		}
		this._pairs = _p;
		console.log(this._pairs);
	}
	
	async refreshPairs() {
		let _proms = [];
		for (let i = 0; i < this._pairs.length; i++) {
			_proms.push(this._pairs[i].refresh());
		}
		
		for (let j = 0; j < _proms.length; j++) {
			await _proms[j];
		}
	}
	
	async pairFor(tokenA, tokenB) {
		const _pAddr = await this._factory.methods.getPair(this.calcName(tokenA), this.calcName(tokenB)).call();
		return this.getLpAt(_pAddr);
	}
	
	async ensureApproval(tokenAddr, rawAmount) {
		const _token = this.getTokenAt(tokenAddr);
		const _currentAllowance = await _token.methods.allowance(this._wallet.currentAddress, RouterAddress).call();
		console.log(_currentAllowance);
		if (BigInt(rawAmount) > BigInt(_currentAllowance)) {
			await _token.methods.approve(RouterAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress});
		}
	}
	
	async getAmountOut(amountIn, path) {
		const amts = await this._router.methods.getAmountsOut(amountIn, path).call();
		return amts[amts.length-1];
	}
	
	async getAmountIn(expectedAmountOut, path) {
		return 0;
	}
	
	// calcPermit(tokensRaw) {
		// // bytes32 digest = keccak256(
			// // abi.encodePacked(
				// // '\x19\x01',
				// // DOMAIN_SEPARATOR,
				// // keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
			// // )
		// // );


		// web3.soliditySha3({"type": "bytes32", "value": PERMIT_TYPEHASH}, {"type": "address", "value": this._wallet.currentAddress}, {"type": "address", "value": RouterAddress}, {"type": "uint256", "value": tokensRaw}, {"type": "uint256", "value": tokensRaw})
	// }
	
	async swapTokenToToken(amountIn, path) {
		await this.ensureApproval(path[0], amountIn);
		return (await this._router.methods.swapExactTokensForTokens(amountIn, 0, path, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "gas": 500000}));
	}
	
	async swapTokenToRPTR(amountIn, path) {
		await this.ensureApproval(path[0], amountIn);
		console.log(path);
		console.log(await this._router.methods.swapExactTokensForETH(amountIn, 0, path, this._wallet.currentAddress, EVM_MAX_UINT256).call({"from": this._wallet.currentAddress}))
		return (await this._router.methods.swapExactTokensForETH(amountIn, 0, path, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "gas": 500000}));
	}

	async swapRPTRToToken(amountIn, path) {
		return (await this._router.methods.swapExactETHForTokens(0, path, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "value": amountIn, "gas": 500000}));
	}
	
	async addLiquidity(tokenA, tokenB, amountA, amountB, amountAmin, amountBmin) {
		let _approvalA = this.ensureApproval(tokenA, amountA);
		let _approvalB = this.ensureApproval(tokenB, amountB);
		await _approvalA;
		await _approvalB;
		return (await this._router.methods.addLiquidity(tokenA, tokenB, amountA, amountB, amountAmin, amountBmin, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "gas": 500000}));
	}
	
	async addLiquidityRPTR(tokenAddr, amountRPTR, amountToken, amountMinRPTR, amountMinToken) {
		await this.ensureApproval(tokenAddr, amountToken);
		return (await this._router.methods.addLiquidityETH(tokenAddr, amountToken, amountMinToken, amountMinRPTR, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "value": amountRPTR, "gas": 500000}));
	}
	
	async removeLiquidity(lpAmount, assetA, assetB, amtAMin, amtBMin) {
		const _pAddr = await this._factory.methods.getPair(this.calcName(tokenA), this.calcName(tokenB)).call();
		await this.ensureApproval(_pAddr, lpAmount);
		return (await this._router.methods.removeLiquidity(tokenA, tokenB, lpAmount, amountAmin, amountBmin, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "gas": 500000}));
	}
	
	async removeLiquidityRPTR(lpAmount, tokenAddr, amountTokenMin, amountRPTRMin) {
		const _pAddr = await this._factory.methods.getPair(this.calcName("RPTR"), this.calcName(tokenAddr)).call();
		await this.ensureApproval(_pAddr, lpAmount);
		return (await this._router.methods.removeLiquidityETH(tokenAddr, lpAmount, amountTokenMin, amountRPTRMin, this._wallet.currentAddress, EVM_MAX_UINT256).send({"from": this._wallet.currentAddress, "gas": 500000}));
	}
	
	async swap(_amountIn, assetFrom, assetTo) {
		const amountIn = web3.toWei(_amountIn);
		const _tType = this.getTradeType(assetFrom, assetTo);
		const _path = this.getPath(assetFrom, assetTo);
		switch (_tType) {
			case 0:
				await this.swapRPTRToToken(amountIn, _path);
				break;
			case 1:
				await this.swapTokenToRPTR(amountIn, _path);
				break;
			case 2:
				await this.swapTokenToToken(amountIn, _path);
				break;
		}
	}
	
	async liquify(amountA, amountB, assetA, assetB) {
		const _type = ((assetA == "RPTR" || (assetB == "RPTR")) ? 1 : 0); // type 1 if addLiquidityRPTR else type 0
		const _rawAmtA = web3.toWei(amountA);
		const _rawAmtB = web3.toWei(amountB);
		switch (_type) {
			case 0:
				this.addLiquidity(assetA, assetB, _rawAmtA, _rawAmtB, 0, 0);
				break;
			case 1:
				const _nonRPTRToken = (assetA == "RPTR") ? assetB : assetA;
				this.addLiquidityRPTR(_nonRPTRToken, _rawAmtA, _rawAmtB, 0, 0);
				break;
		}
	}
	
	async removeLP(LPAmt, assetA, assetB) {
		const _type = ((assetA == "RPTR" || (assetB == "RPTR")) ? 1 : 0); // type 1 if removeLiquidityRPTR else type 0
		const _rawAmt = web3.toWei(String(LPAmt));
		switch (_type) {
			case 0:
				this.removeLiquidity(_rawAmt, assetA, assetB, 0, 0);
				break;
			case 1:
				const _nonRPTRToken = (assetA == "RPTR") ? assetB : assetA;
				this.removeLiquidityRPTR(_rawAmt, _nonRPTRToken, 0, 0);
				break;
		}
	}
	
	async assetBalance(assetName) {
		console.log(`Pulling ${assetName} balance`);
		switch (assetName) {
			case "RPTR":
				return web3.fromWei(await this._wallet.eth_getBalance(this._wallet.currentAddress, EVM_MAX_UINT256));
			default:
				return web3.fromWei(await this.getTokenAt(assetName).methods.balanceOf(this._wallet.currentAddress).call());
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