import { Wallet } from '../wallet';
import { Contract } from 'web3-eth-contract';
import { Raptor } from './raptor';
import { RaptorStatistics } from './statistics'

export class RaptorFarm {

	private static readonly address: string = "0x540647470C039dD7c93b2dfe328264d1a56e3074";

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;

	private _lpBalance: number = 0;
	private _stakedLp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;
	private _pid: number = 0;
	private _lpAddress: string = "";

	constructor(wallet: Wallet, pid: number) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}
		this._pid = pid;
		this._wallet = wallet;
		this._raptor = new Raptor(wallet);
		this._contract = wallet.connectToContract(RaptorFarm.address, require('./raptorfarm.abi.json'));
		this._stats = new RaptorStatistics();
	}

	toFixed(x) {
	  if (Math.abs(x) < 1.0) {
		var e = parseInt(x.toString().split('e-')[1]);
		if (e) {
			x *= Math.pow(10,e-1);
			x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		}
	  } else {
		var e = parseInt(x.toString().split('+')[1]);
		if (e > 20) {
			e -= 20;
			x /= Math.pow(10,e);
			x += (new Array(e+1)).join('0');
		}
	  }
	  return x;
	}

	async finishSetup() {
		this._lpAddress = (await this._contract.methods.poolInfo(this._pid).call()).lpToken;
		this._lpToken = this._wallet.connectToContract(this._lpAddress, require("./erc20.abi.json"));
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
	
	get contract(): Contract {
		return this._contract;
	}

	async refresh(): Promise<void> {
		await this._raptor.refresh();

		const _totalLp = (await this._lpToken.methods.totalSupply().call());
		const raptorPerLPToken = (await this._raptor.contract.methods.balanceOf(this._lpAddress).call()) / _totalLp;
		const stakedRaptorInLPs = (await this._lpToken.methods.balanceOf(RaptorFarm.address).call()) * raptorPerLPToken;

		const raptorPerYear = ((await this._contract.methods.raptorPerBlock().call()) * 10512000) * ((await this._contract.methods.poolInfo(this._pid).call()).allocPoint / (await this._contract.methods.totalAllocPoint().call())) * (await this._contract.methods.BONUS_MULTIPLIER().call())

		this._apr = ((raptorPerYear / stakedRaptorInLPs) * 50); // *50 for balancing that pooled bnb isn't counted (50/50 pool)

		this._rewards = (await this._contract.methods.pendingCake(this._pid, this._wallet.currentAddress).call()) / 10 ** 9;
		this._lpBalance = (await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) / 10 ** 18;
		this._stakedLp = (await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount / 10 ** 18;
	}

	async deposit(amount: number): Promise<void> {
		await this._raptor.refresh();
		const rawAmount: number = amount * 10 ** 18;

		if ((await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) >= rawAmount) {
			const allowance = (await this._lpToken.methods.allowance(this._wallet.currentAddress, RaptorFarm.address).call());

			if (allowance < rawAmount) {
				// we need to give allowance to farming contract first
				const allowance = `${BigInt(2 ** 256) - BigInt(1)}`;
				await this._lpToken.methods.approve(RaptorFarm.address, allowance).send({ 'from': this._wallet.currentAddress });
			}
			await this._contract.methods.deposit(this._pid, String(this.toFixed(rawAmount))).send({ 'from': this._wallet.currentAddress });
		}
		else {
			throw 'Your LP balance is not sufficient';
		}
	}

	async withdraw(amount: number): Promise<void> {
		await this._raptor.refresh()
		const rawAmount: number = amount * 10 ** 18;

		if ((await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount >= rawAmount) {

			const rawAmount: number = amount * 10 ** 18;
			await this._contract.methods.withdraw(this._pid, String(this.toFixed(rawAmount))).send({ 'from': this._wallet.currentAddress });
		}
		else {
			throw 'Your staked LP balance is not sufficient';
		}
	}

	async claim(): Promise<void> {
		await this._raptor.refresh();
		await this._contract.methods.deposit(this._pid, 0).send({ 'from': this._wallet.currentAddress });
	}
}
