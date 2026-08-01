import { Wallet, ReadOnlyProvider } from '../wallet';
import { Contract } from 'web3-eth-contract';
import { Raptor } from './raptor';
import { RaptorStatistics } from './statistics'

import {
	CHAIN,
	CONTRACTS,
	RPC,
	STABLE_COINS_BSC,
	WBNB_BSC,
	RPTR_TOKEN,
	EVM_MAX_UINT256,
} from '../../config';
import { fromRawUnits, toRawUnits } from '../../utils/units';

export class RaptorFarmNew {

	private static readonly address: string = CONTRACTS.RAPTOR_FARM_NEW;

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _contractView: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;
	private readonly _lpTokenView: Contract;

	private readonly _viewProvider: ReadOnlyProvider;

	private _setupFinished: any;
	private _lpBalance: number = 0;
	private _stakedLp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;
	private _pid: number = 0;
	private _usdbalanceavbl: number = 0;
	private _usdbalancestaked: number = 0;
	private _usdpendingrewards: number = 0;
	private _raptorPerLP: number = 0;
	private _tvl: number = 0;
	private _lpAddress: string = "";
	private _stablecoins = STABLE_COINS_BSC;

	async finishSetup() {
		await this._stats.refresh();
		this._lpAddress = (await this._contractView.methods.poolInfo(this._pid).call()).lpToken;
		this._lpTokenView = this._viewProvider.connectToContract(this._lpAddress, require("./lptoken.abi.json"));
	}

	constructor(pid: number) {
		this._pid = pid;
		this._stats = new RaptorStatistics();
		this._viewProvider = new ReadOnlyProvider(RPC[CHAIN.BSC], CHAIN.BSC, null);
		this._contractView = this._viewProvider.connectToContract(RaptorFarmNew.address, require('./raptorfarm.abi.json'));
		
		this._setupFinished = this.finishSetup();
	}
	
	connectWallet(wallet: Wallet) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}
		this._wallet = wallet;
		this._contract = wallet.connectToContract(RaptorFarmNew.address, require('./raptorfarm.abi.json'));
		this._lpToken = this._wallet.connectToContract(this._lpAddress, require("./lptoken.abi.json"));
	}

	get wallet(): Wallet {
		return this._wallet;
	}

	get lpBalance(): number {
		return this._lpBalance;
	}

	get rewards(): number {
		return this._rewards;
	}

	get stakedLp(): number {
		return this._stakedLp;
	}

	get apr(): number {
		return this._apr;
	}
	
	get tvl(): number {
		return this._tvl;
	}
	
	get usdavailable(): number {
		return this._usdbalanceavbl;
	}
	
	get usdstaked(): number {
		return this._usdbalancestaked;
	}

	get usdrewards(): number {
		return this._usdpendingrewards;
	}
	
	get contract(): Contract {
		return this._contract;
	}
	
	get contractView(): Contract {
		return this._contractView;
	}
	
	async pooledRPTREquivalent(otherToken) {
		if (otherToken == WBNB_BSC) {	// WBNB address
			const _wbnb = this._viewProvider.connectToContract(WBNB_BSC, require("./erc20.abi.json"));
			return (this._stats.bnbToRaptor(fromRawUnits(await _wbnb.methods.balanceOf(this._lpToken._address).call())));
		}
		else {
			for(let n = 0; n < this._stablecoins.length; n++) {
				if (otherToken == this._stablecoins[n]) {
					const _stablecoin = this._viewProvider.connectToContract(this._stablecoins[n], require("./erc20.abi.json"));
					return (this._stats.usdToRaptor(fromRawUnits(await _stablecoin.methods.balanceOf(this._lpToken._address).call())));
				}
			}
			return 0;
		}
	}
	
	async raptorPerFarmToken() {
		const rptrAddress = RPTR_TOKEN[CHAIN.BSC];
		const dummyAddress = "0x2a05D1b3D27BB092EBDD6b717940D4b93BbC729e";
		if (this._lpTokenView._address == rptrAddress) {
			return 1;
		}
		if (this._lpTokenView._address == dummyAddress) {
			return 0;
		}
		const tokenSupply = await this._lpTokenView.methods.totalSupply().call();
		let _tokensInPair = [(await this._lpTokenView.methods.token0().call()), await this._lpTokenView.methods.token1().call()]
		if (_tokensInPair.includes(rptrAddress)) {
			const pooledRPTR = await this._viewProvider.getRaptorBalance(this._lpAddress);
			return (pooledRPTR*2)/tokenSupply;
		} else {
			for (let i=0; i<_tokensInPair.length; i++) {
				let _equivalent = await this.pooledRPTREquivalent(_tokensInPair[i]);
				if (_equivalent > 0) {
					return (_equivalent*2)/tokenSupply;
				}
			}
		}
		return 0;
	}

	async refreshAPR() {
		const _raptorUsd = this._stats.raptorUsdPrice;
		const _totalLp = (await this._lpTokenView.methods.totalSupply().call());
		const raptorPerLPToken = await this.raptorPerFarmToken();
		
		this._raptorPerLP = raptorPerLPToken;
		
		const stakedRaptorInLPs = (await this._lpTokenView.methods.balanceOf(RaptorFarmNew.address).call()) * raptorPerLPToken;

		const raptorPerYear = ((await this._contractView.methods.raptorPerBlock().call()) * 21024000) * ((await this._contractView.methods.poolInfo(this._pid).call()).allocPoint / (await this._contractView.methods.totalAllocPoint().call())) * (await this._contractView.methods.BONUS_MULTIPLIER().call())

		this._apr = ((raptorPerYear / stakedRaptorInLPs) * 100);
		this._tvl = (_raptorUsd*stakedRaptorInLPs)/10**18;
	}

	async refresh(): Promise<void> {
		await this._setupFinished;

		const _raptorUsd = this._stats.raptorUsdPrice;

		// refreshes apr/tvl when one of them is zero
		if (this._apr == 0 || this._tvl == 0) {
			await this.refreshAPR();
		}

		if (!this._contract) {
			return;	// halts here if wallet isn't connected
			// since functions here require wallet to be connected
		}
		
		this._rewards = fromRawUnits(await this._contract.methods.pendingCake(this._pid, this._wallet.currentAddress).call());
		this._lpBalance = fromRawUnits(await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call());
		this._stakedLp = fromRawUnits((await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount);

		this._usdbalancestaked = _raptorUsd*this._raptorPerLP*this._stakedLp;
		this._usdbalanceavbl = _raptorUsd*this._raptorPerLP*this._lpBalance;
		this._usdpendingrewards = _raptorUsd*this._rewards;
	}

	async deposit(amount: number): Promise<void> {
		const rawAmount = BigInt(toRawUnits(amount));
		if (BigInt(await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) >= rawAmount) {
			const allowance = BigInt(await this._lpToken.methods.allowance(this._wallet.currentAddress, RaptorFarmNew.address).call());

			if (allowance < BigInt(rawAmount)) {
				// we need to give allowance to farming contract first
				await this._lpToken.methods.approve(RaptorFarmNew.address, EVM_MAX_UINT256).send({ 'from': this._wallet.currentAddress });
			}
			await this._contract.methods.deposit(this._pid, rawAmount).send({ 'from': this._wallet.currentAddress, 'gasPrice': 3000000000 });
		}
		else {
			throw 'Your LP balance is not sufficient';
		}
	}

	async withdraw(amount: number): Promise<void> {
		const rawAmount = BigInt(toRawUnits(amount));

		if (BigInt((await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount) >= rawAmount) {
			await this._contract.methods.withdraw(this._pid, rawAmount).send({ 'from': this._wallet.currentAddress, 'gasPrice': 3000000000 });
		}
		else {
			throw 'Your staked LP balance is not sufficient';
		}
	}

	async claim(): Promise<void> {
		await this._contract.methods.deposit(this._pid, 0).send({ 'from': this._wallet.currentAddress, 'gasPrice': 3000000000 });
	}
}
