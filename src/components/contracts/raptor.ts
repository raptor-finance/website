import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const RaptorAddress = "0xf9A3FdA781c94942760860fc731c24301c83830A";
export const RaptorAddressv3 = "0x44C99Ca267C2b2646cEEc72e898273085aB87ca5";
export const DonationWalletAddress = "0x50dF6f99c75Aeb6739CB69135ABc6dA77C588f93"

export class Raptor {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _contractv3: Contract;

	private _balance: number = 0;
	private _balancev3: number = 0;
	private _stake: number = 0;
	private _pendingRewards: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._contract = wallet.connectToContract(RaptorAddress, require('./raptor.abi.json'));
		try {
			this._contractv3 = wallet.connectToContract(RaptorAddressv3, require('./raptor.abi.json'));
		}
		catch (e) {
			// throw "Raptor v3 not yet deployed"
		}
	}

	get contract(): Contract {
		return this._contract;
	}

	get contractv3(): Contract {
		return this._contractv3;
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get balance(): number {
		return this._balance;
	}
	get balancev3(): number {
		return this._balancev3;
	}
	get stakedBalance(): number {
		return this._stake;
	}
	get pendingStakeRewards(): number {
		return this._pendingRewards;
	}

	async stake(amount: number): Promise<void> {
		throw "Staking will be deprecated soon, please migrate to v3 tokens and stake them on farm page !";
	}
	async unstakeAndClaim(amount: number): Promise<void> {
		await this.refresh();

		if (this._stake >= amount) {
			await this._contract.methods.withdrawStake(web3.toWei(String(amount - 0.0001),'gwei')).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked Raptor balance is not sufficient to unstake this amount';
		}
	}
	async claim(): Promise<void> {
		await this._contract.methods.claimStakingRewards().send({'from': this._wallet.currentAddress});
		await this.refresh();
	}
	
	async migrate(amount:number): Promise<void> {
		if (this._balance >= amount) {
			await this._contract.methods.approveAndCall(this._contractv3._address,web3.toWei(String(amount),'gwei'),"0x0").send({'from': this._wallet.currentAddress});
		}
		else {
			throw `Your balance isn't sufficient to migrate ${amount} raptors, maximum : ${this._balance}`;
		}
	}

	async refresh(): Promise<void> {
		this._balance = web3.fromWei(await this._contract.methods.balanceOf(this._wallet.currentAddress).call(), "gwei");
		this._balancev3 = web3.fromWei(await this._contractv3.methods.balanceOf(this._wallet.currentAddress).call(), "ether");
		this._stake = web3.fromWei(await this._contract.methods.stakedBalanceOf(this._wallet.currentAddress).call(), "gwei");
		this._pendingRewards = web3.fromWei(await this._contract.methods.pendingRewards(this._wallet.currentAddress).call(), "gwei");
	}
}
