import {Wallet} from "../wallet";
import {Contract} from "web3-eth-contract";

export class Raptor {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;

	private _balance: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._contract = wallet.connectToContract("0xf9A3FdA781c94942760860fc731c24301c83830A", require('./raptor.abi.json'));
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

	async refresh(): Promise<void> {
		const rawBalance = await this._contract.methods.balanceOf(this._wallet.currentAddress).call();
		this._balance = rawBalance / (10 ** 9);
	}
}
