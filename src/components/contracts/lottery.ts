import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import {Raptor} from './raptor';

export class RaptorLottery {

	private static readonly address: string = "0x468F4B97a881a81dB6b242889556aBF7fCB2a6A0";
	//private static readonly address: string = "0x4aaD1aD8628003487623A61305dE7Fc4D6A887ff";

	private readonly _ticketPrice = 10**3;

	private readonly _wallet: Wallet;
	private readonly _contractv3: Contract;
	private readonly _raptor: Raptor;

	private _tickets: number = 0;
	private _jackpot: number = 0;
	private _totalTickets: number = 0;
	private _drawNumber: number = 0;
	private _lastWinner: string = null;

	constructor(wallet: Wallet) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}

		this._wallet = wallet;
		this._contractv3 = wallet.connectToContract(RaptorLottery.address, require('./lottery.abi.json'));
		this._raptor = new Raptor(wallet);
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get raptor(): Raptor {
		return this._raptor;
	}
	get tickets(): number {
		return this._tickets;
	}
	get ticketPrice(): number {
		return this._ticketPrice;
	}
	get jackpot(): number {
		return this._jackpot;
	}
	get totalTickets(): number {
		return this._totalTickets;
	}
	get lastWinner(): string {
		return this._lastWinner;
	}
	get drawNumber(): number {
		return this._drawNumber;
	}

	async refresh(): Promise<void> {
		await this._raptor.refresh();

		this._tickets = await this._contractv3.methods.ticketBalanceOf(this._wallet.currentAddress).call();
		this._jackpot = await this._contractv3.methods.currentJackpot().call() / (10**18)

		this._drawNumber = await this._contractv3.methods.currentDraw().call();
        let round = await this._contractv3.methods.round(this._drawNumber-1).call();
        this._totalTickets = round.tickets;
        this._lastWinner = round.winner;
	}

	async buyTicket(): Promise<string> {
		await this._raptor.refresh()


		if (this._raptor.balancev3 >= this._ticketPrice) {
			const allowance = +(await this._raptor.contractv3.methods.allowance(this._wallet.currentAddress, RaptorLottery.address).call());

			// if (allowance < rawPrice) {
				// // we need to give allowance to lottery contract first
				// const allowance = `${BigInt(2**256) - BigInt(1)}`;
				// await this._raptor.contractv3.methods.approve(RaptorLottery.address, allowance).send({'from': this._wallet.currentAddress});
			// }

			const receipt = await this._raptor._contractv3.methods.approveAndCall(RaptorLottery.address, "1000000000000000000000", "0x0").send({'from': this._wallet.currentAddress});
			console.log(receipt);
			return receipt.events.NewTicket.returnValues.hash;
		}
		else {
			throw 'Your Raptor balance is not sufficient to buy a ticket';
		}
	}
}
