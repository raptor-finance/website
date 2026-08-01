import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

import {
	CHAIN,
	RPTR_TOKEN,
	RPTR_V2_BSC,
	RPTR_TESTNET_BSC,
	DONATION_WALLET,
} from '../../config';
import { fromRawUnits, toRawUnits } from '../../utils/units';

export const RaptorAddress = RPTR_V2_BSC;
export const RaptorAddressv3 = RPTR_TOKEN[CHAIN.BSC];
export const TestnetRaptorAddressv3 = RPTR_TESTNET_BSC;
export const DonationWalletAddress = DONATION_WALLET;

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
		if (this._wallet.chainId == CHAIN.BSC) {
			this._contract = wallet.connectToContract(RaptorAddress, require('./raptor.abi.json'));
			this._contractv3 = wallet.connectToContract(RaptorAddressv3, require('./raptor.abi.json'));
		}
		else {
			this._contract = wallet.connectToContract(TestnetRaptorAddressv3, require('./raptor.abi.json'));
			this._contractv3 = wallet.connectToContract(TestnetRaptorAddressv3, require('./raptor.abi.json'));
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

	/**
	 * Staking v2 is deprecated. This method intentionally throws so the legacy
	 * "Stake" button on the deprecated staking page can never execute a tx.
	 */
	async stake(amount: number): Promise<void> {
		throw "Staking will be deprecated soon, please migrate to v3 tokens and stake them on farm page !";
	}

	async unstakeAndClaim(amount: number): Promise<void> {
		await this.refresh();

		if (this._stake >= amount) {
			// v2 Raptor token has 9 decimals
			await this._contract.methods.withdrawStake(toRawUnits(amount - 0.0001, 9)).send({'from': this._wallet.currentAddress});
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
			// v2 Raptor token has 9 decimals
			await this._contract.methods.approveAndCall(this._contractv3._address,toRawUnits(amount, 9),"0x0").send({'from': this._wallet.currentAddress});
		}
		else {
			throw `Your balance isn't sufficient to migrate ${amount} raptors, maximum : ${this._balance}`;
		}
	}

	async refresh(): Promise<void> {
		if (this._wallet.chainId == this._wallet.raptorChainID) {
			this._balance = 0;
			this._balancev3 = fromRawUnits(await this._wallet.eth_getBalance(this._wallet.currentAddress));
			return
		}
		this._balance = 0;
		this._balancev3 = 0;
		if (this._wallet.chainId == CHAIN.BSC) {
			// v2 Raptor token (balance/stake/rewards) has 9 decimals; v3 has 18
			this._balance = fromRawUnits(await this._contract.methods.balanceOf(this._wallet.currentAddress).call(), 9);
			this._stake = fromRawUnits(await this._contract.methods.stakedBalanceOf(this._wallet.currentAddress).call(), 9);
			this._pendingRewards = fromRawUnits(await this._contract.methods.pendingRewards(this._wallet.currentAddress).call(), 9);
			this._balancev3 = fromRawUnits(await this._contractv3.methods.balanceOf(this._wallet.currentAddress).call());
		}
	}
}
