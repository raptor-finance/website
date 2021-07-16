import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import {Raptor} from './raptor';
import {RaptorStatistics} from './statistics'

export class RaptorFarm {

	private static readonly address: string = "0x994A361F603924A9357f6E2191C31829bf83fC21";

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;

	private _lpbalance: number = 0;
	private _stakedlp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;
	private _pid: number = 0;
	private _lpaddress: string = "";


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

	async finishSetup() {
		this._lpaddress = (await this._contract.methods.poolInfo(this._pid).call()).lpToken;
		this._lpToken = this._wallet.connectToContract(this._lpaddress, require("./erc20.abi.json"));
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get raptor(): Raptor {
		return this._raptor;
	}
	
	get lpbalance(): number {
		return this._lpbalance;
	}
	
	get rewards(): number {
		return this._rewards;
	}
	
	get stakedlp(): number {
		return this._stakedlp;
	}

	get apr(): number {
		return this._apr;	
	}
	
	
	async refresh(): Promise<void> {
		await this._raptor.refresh();
		const dec = 10**18;
		
		const _totalLp = (await this._lpToken.methods.totalSupply().call());
		const raptorPerLPToken = (await this._raptor.contract.methods.balanceOf(this._lpaddress).call())/_totalLp;
		const stakedRaptorInLPs = (await this._lpToken.methods.balanceOf(RaptorFarm.address).call()) * raptorPerLPToken;
		
		const raptorperyear = ((await this._contract.methods.raptorPerBlock().call())*10512000) * ((await this._contract.methods.poolInfo(this._pid).call()).allocPoint / (await this._contract.methods.totalAllocPoint().call())) * (await this._contract.methods.BONUS_MULTIPLIER().call())
		
		this._apr = ((raptorperyear/stakedRaptorInLPs)*50); // *50 for balancing that pooled bnb isn't counted (50/50 pool)
		
		this._rewards = (await this._contract.methods.pendingCake(this._pid, this._wallet.currentAddress).call()) / 10**9;
		this._lpbalance = (await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) / 10**18;
		this._stakedlp = (await this._contract.methods.userInfo(this._pid, this._wallet.currentAddress).call()).amount / 10**18;
	}
	
	async deposit(amount: number): Promise<void> {
		await this._raptor.refresh();
		const rawAmount: number = amount * 10 ** 18;

		if (this._raptor.balance * 10 ** 18 >= rawAmount) {
			const allowance = (await this._lpToken.methods.allowance(this._wallet.currentAddress, RaptorFarm.address).call());

			if (allowance < rawAmount) {
				// we need to give allowance to farming contract first
				const allowance = `${BigInt(2**256) - BigInt(1)}`;
				await this._lpToken.methods.approve(RaptorFarm.address, allowance).send({'from': this._wallet.currentAddress});
			}
			await this._contract.methods.deposit(this._pid, rawAmount).send({'from': this._wallet.currentAddress}).send({'from': this._wallet.currentAddress});
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
			await this._contract.methods.withdraw(this._pid, rawAmount).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked LP balance is not sufficient';
		}
	}
	
	async claim(): Promise<void> {
		await this._raptor.refresh();
		await this._contract.methods.deposit(this._pid, 0).send({'from': this._wallet.currentAddress});
	}
	
}
