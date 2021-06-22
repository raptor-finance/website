import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const RaptorAddress = "0xf9A3FdA781c94942760860fc731c24301c83830A";
export const DonationWalletAddress = "0x50dF6f99c75Aeb6739CB69135ABc6dA77C588f93"

export class Raptor {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;

	private _balance: number = 0;
	private _stake: number = 0;
	private _pendingRewards: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._contract = wallet.connectToContract(RaptorAddress, require('./raptor.abi.json'));
	}

	get contract(): Contract {
		return this._contract;
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get balance(): number {
		return this._balance;
	}
	get stakedBalance(): number {
		return this._stake;
	}
	get pendingStakeRewards(): number {
		return this._pendingRewards;
	}

	async stake(amount: number): Promise<void> {
		await this.refresh();

		if (this._balance >= amount) {
			await this._contract.methods.stakeIn(web3.toWei(String(amount),'gwei')).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your Raptor balance is not sufficient to stake this amount';
		}
	}
	async unstakeAndClaim(amount: number): Promise<void> {
		await this.refresh();

		if (this._stake >= amount) {
			await this._contract.methods.withdrawStake(web3.toWei(String(amount),'gwei')).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked Raptor balance is not sufficient to unstake this amount';
		}
	}
	async claim(): Promise<void> {
		await this._contract.methods.claimStakingRewards().send({'from': this._wallet.currentAddress});
		await this.refresh();
	}

	async refresh(): Promise<void> {
		this._balance = await this._contract.methods.balanceOf(this._wallet.currentAddress).call() / (10 ** 9);
		this._stake = await this._contract.methods.stakedBalanceOf(this._wallet.currentAddress).call() / (10 ** 9);
		this._pendingRewards = await this._contract.methods.pendingRewards(this._wallet.currentAddress).call() / (10 ** 9);
	}
}
