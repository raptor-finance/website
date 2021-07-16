import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import {Raptor} from './raptor';
import {RaptorStatistics} from './statistics'

export class RaptorFarm {

	private static readonly address: string = "0xF1Aa8522CC2C96bf51fEf0Fd6852b6da394C21C1";
	private static readonly raptorbnblp: string = "0xb10B52b7749632DBc0F55Dccb76C09Cd85326790";

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;

	private _lpbalance: number = 0;
	private _stakedlp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;

	constructor(wallet: Wallet) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}

		this._wallet = wallet;
		this._contract = wallet.connectToContract(RaptorFarm.address, require('./raptorfarm.abi.json'));
		this._raptor = new Raptor(wallet);
		this._stats = new RaptorStatistics();
		this._lpToken = wallet.connectToContract(require("./erc20.abi.json"), this.raptorbnblp);
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
	
	async calculateApr(): Promise<void> {
		const _totalLp = (await this._lpToken.methods.totalSupply().call());
		const raptorPerLPToken = (await this._raptor.methods.balanceOf(this.raptorbnblp).call())/_totalLp;
		const stakedRaptorInLPs = (await this._lpToken.methods.balanceOf(this.address).call()) * raptorPerLPToken;
		this._apr = ((157680000000000/stakedRaptorInLPs)*100)-100;
	}
	
	
	async refresh(): Promise<void> {
		await this._raptor.refresh();
		const dec = 10**18;
		await calculateApr();
		
		this._rewards = (await this.contract.methods.pendingCake(0, this._wallet.currentAddress).call()) / 10**9;
		this._lpbalance = (await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) / 10**18;
		this._stakedlp = (await this._contract.methods.userInfo(0, this._wallet.currentAddress).call()).amount / 10**18;
	}
	
	async deposit(amount: number): Promise<void> {
		await this._raptor.refresh();
		const rawAmount: number = amount * 10 ** 18;

		if (this._raptor.balance * 10 ** 18 >= rawAmount) {
			const allowance = (await this._lptoken.methods.allowance(this._wallet.currentAddress, RaptorLottery.address).call());

			if (allowance < rawAmount) {
				// we need to give allowance to lottery contract first
				const allowance = `${BigInt(2**256) - BigInt(1)}`;
				await this._lptoken.methods.approve(RaptorLottery.address, allowance).send({'from': this._wallet.currentAddress});
			}
			await this._contract.methods.deposit(0, rawAmount).send({'from': this._wallet.currentAddress}).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your LP balance is not sufficient';
		}
	}
	
	async withdraw(amount: number): Promise<void> {
		await this._raptor.refresh()
		const rawAmount: number = amount * 10 ** 18;		
		
		if ((await this._contract.methods.userInfo(pid, this._wallet.currentAddress).call()).amount >= rawAmount) {
		
			const rawAmount: number = amount * 10 ** 18;
			await this._contract.methods.withdraw(0, rawAmount).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked LP balance is not sufficient to buy a ticket';
		}
	}
	
	async claim(): Promise<void> {
		await this._raptor.refresh();
		await this._contract.methods.deposit(0, 0).send({'from': this._wallet.currentAddress});
	}
	
}
