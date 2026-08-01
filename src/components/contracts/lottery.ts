import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import {Raptor} from './raptor';

import { CONTRACTS } from '../../config';
import { fromRawUnits, toRawUnits } from '../../utils/units';

export class RaptorLottery {

	private static readonly address: string = CONTRACTS.RAPTOR_LOTTERY;

	private readonly _ticketPrice = 42000;
	private readonly _drawTime = 604800;

	private readonly _wallet: Wallet;
	private readonly _contractv3: Contract;
	private readonly _raptor: Raptor;

	private _tickets: number = 0;
	private _jackpot: number = 0;
	private _totalTickets: number = 0;
	private _drawNumber: number = 0;
	private _lastWinner: string = null;

	private _lastDraw: number = 0;

	private _lastDrawPromise: Promise;

	constructor(wallet: Wallet) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}

		this._wallet = wallet;
		this._contractv3 = wallet.connectToContract(RaptorLottery.address, require('./lottery.abi.json'));
		this._raptor = new Raptor(wallet);
		this._lastDrawPromise = this._contractv3.methods.lastDraw().call();
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
	
	get countdown(): number {
		const expectedDate = (Number(this._lastDraw) + Number(this._drawTime));
		let currentDate = ((new Date()).getTime()/1000);
		return Math.max(Math.round(expectedDate - currentDate), 0);
	}

	async refresh(): Promise<void> {
		await this._raptor.refresh();

		this._tickets = await this._contractv3.methods.ticketBalanceOf(this._wallet.currentAddress).call();
		this._jackpot = fromRawUnits(await this._contractv3.methods.currentJackpot().call());

		this._drawNumber = await this._contractv3.methods.currentDraw().call();
        const prevRound = await this._contractv3.methods.round(this._drawNumber-1).call();
        const currentRound = await this._contractv3.methods.round(this._drawNumber).call();
        this._totalTickets = currentRound.tickets;
        this._lastWinner = prevRound.winner;
		this._lastDraw = await this._lastDrawPromise;
	}

	async buyTicket(): Promise<string> {
		await this._raptor.refresh()

		if (this._raptor.balancev3 >= this._ticketPrice) {
			// amount derived from the _ticketPrice constant instead of a hardcoded literal
			const rawPrice = toRawUnits(this._ticketPrice);
			const receipt = await this._raptor.contractv3.methods.approveAndCall(RaptorLottery.address, rawPrice, "0x0").send({'from': this._wallet.currentAddress});
			return receipt.events["0"].raw.topics[2];
		}
		else {
			throw 'Your Raptor balance is not sufficient to buy a ticket';
		}
	}
}
