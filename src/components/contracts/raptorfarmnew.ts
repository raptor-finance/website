import { Wallet } from '../wallet';
import { Contract } from 'web3-eth-contract';
import { Raptor } from './raptor';
import { RaptorStatistics } from './statistics'
import * as web3 from 'web3-utils';

export class RaptorFarmNew {

	private static readonly address: string = "0xA21F55B2195aF7942B33372aF8a078F3c22f9F75";

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;

	private _setupFinished: any;
	private _lpBalance: number = 0;
	private _stakedLp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;
	private _pid: number = 0;
	private _usdbalanceavbl: number = 0;
	private _usdbalancestaked: number = 0;
	private _usdpendingrewards: number = 0;
	private _tvl: number = 0;
	private _lpAddress: string = "";
	private _stablecoins = ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0x55d398326f99059fF775485246999027B3197955", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", "0x23396cF899Ca06c4472205fC903bDB4de249D6fC"];

	async finishSetup() {
		await this._stats.refresh();
		this._lpAddress = (await this._contract.methods.poolInfo(this._pid).call()).lpToken;
		this._lpToken = this._wallet.connectToContract(this._lpAddress, require("./lptoken.abi.json"));
	}

	constructor(wallet: Wallet, pid: number) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}
		this._pid = pid;
		this._wallet = wallet;
		this._raptor = new Raptor(wallet);
		this._contract = wallet.connectToContract(RaptorFarmNew.address, require('./raptorfarm.abi.json'));
		this._stats = new RaptorStatistics();
		this._setupFinished = this.finishSetup();
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get raptor(): Raptor {
		return this._raptor;
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
	
	async raptorInLp() {
		if (this._lpToken._address == "0x44C99Ca267C2b2646cEEc72e898273085aB87ca5") {
			return (await this._lpToken.methods.totalSupply().call()/2);
		}
		var _tokensInPair = [(await this._lpToken.methods.token0().call()), await this._lpToken.methods.token1().call()]
		if (_tokensInPair.includes(this._raptor.contract._address)) {
			return (await this._raptor.contract.methods.balanceOf(this._lpAddress).call());
		}
		else if (_tokensInPair.includes("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")) {
			const _wbnb = this._wallet.connectToContract("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", require("./erc20.abi.json"));
			return (this._stats.bnbToRaptor((await _wbnb.methods.balanceOf(this._lpToken._address).call())/10**9));
		}
		else {
			for(let n = 0; n < this._stablecoins.length; n++) {
				if (_tokensInPair.includes(this._stablecoins[n])) {
					const _stablecoin = this._wallet.connectToContract(this._stablecoins[n], require("./erc20.abi.json"));
					return (this._stats.usdToRaptor((await _stablecoin.methods.balanceOf(this._lpToken._address).call())/10**9));
				}
			}
			return 0;
		}
	}

	async refresh(): Promise<void> {
		console.log(`Updating pid ${this._pid}`)
		await this._setupFinished;
		await this._raptor.refresh();
		const _raptorUsd = this._stats.raptorUsdPrice*10**6;
		const _totalLp = (await this._lpToken.methods.totalSupply().call());
		const raptorPerLPToken = (await this.raptorInLp()) / _totalLp;
		const stakedRaptorInLPs = (await this._lpToken.methods.balanceOf(RaptorFarmNew.address).call()) * raptorPerLPToken;

		const raptorPerYear = ((await this._contract.methods.raptorPerBlock().call()) * 10512000) * ((await this._contract.methods.poolInfo(this._pid).call()).allocPoint / (await this._contract.methods.totalAllocPoint().call())) * (await this._contract.methods.BONUS_MULTIPLIER().call())

		this._apr = ((raptorPerYear / stakedRaptorInLPs) * 50);

		this._rewards = (await this._contract.methods.pendingCake(this._pid, this._wallet.currentAddress).call()) / 10 ** 18;
		this._lpBalance = (await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) / 10 ** 18;
		this._stakedLp = (await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount / 10 ** 18;
		this._usdbalancestaked = _raptorUsd*raptorPerLPToken*2*this._stakedLp;

		this._usdbalanceavbl = _raptorUsd*raptorPerLPToken*2*this._lpBalance;
		this._usdpendingrewards = _raptorUsd*this._rewards;
		this._tvl = (_raptorUsd*stakedRaptorInLPs*2)/10**18;
	}

	async deposit(amount: number): Promise<void> {
		// await this._raptor.refresh();
		const rawAmount = web3.toWei(amount);
		if ((await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) >= rawAmount) {
			const allowance = (await this._lpToken.methods.allowance(this._wallet.currentAddress, RaptorFarmNew.address).call());

			if (allowance < Number(rawAmount)) {
				// we need to give allowance to farming contract first
				const allowance = `${BigInt(2 ** 256) - BigInt(1)}`;
				await this._lpToken.methods.approve(RaptorFarmNew.address, allowance).send({ 'from': this._wallet.currentAddress });
			}
			await this._contract.methods.deposit(this._pid, rawAmount).send({ 'from': this._wallet.currentAddress });
		}
		else {
			throw 'Your LP balance is not sufficient';
		}
	}

	async withdraw(amount: number): Promise<void> {
		// await this._raptor.refresh()
		const rawAmount = web3.toWei(amount);

		if ((await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount >= rawAmount) {
			await this._contract.methods.withdraw(this._pid, rawAmount).send({ 'from': this._wallet.currentAddress });
		}
		else {
			throw 'Your staked LP balance is not sufficient';
		}
	}

	async claim(): Promise<void> {
		// await this._raptor.refresh();
		await this._contract.methods.deposit(this._pid, 0).send({ 'from': this._wallet.currentAddress });
	}
}
