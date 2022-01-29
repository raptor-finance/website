import axios from 'axios';
import { RaptorAddressv3, DonationWalletAddress } from './raptor';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

type PriceInfo = { 
	raptor: { 
		usd: number, 
		bnb: number 
	}, 
	bnb: { 
		usd: number
	},
	marketCap: {
		usd: number
	}
	totalSupply: {
		value: number
	}
};

export class RaptorStatistics {

	private readonly _web3: Web3;
	private readonly _raptor: Contract;
	private readonly _usd: Contract;

	private _prices?: PriceInfo = null;
	private _donationWalletBalance?: number;

	constructor() {

		const erc20: any = [
			{
				"constant": true,
				"inputs": [{ "name": "_owner", "type": "address" }],
				"name": "balanceOf",
				"outputs": [{ "name": "balance", "type": "uint256" }],
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "decimals",
				"outputs": [{ "name": "", "type": "uint8" }],
				"type": "function"
			}
		];

		this._web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
		this._usd = new this._web3.eth.Contract(erc20, "0xe9e7cea3dedca5984780bafc599bd69add087d56");
		this._raptor = new this._web3.eth.Contract(erc20, RaptorAddressv3);
	}

	public async refresh() {	
		const prices: PriceInfo = await this.getPrices(true);

		const bnbBalance: number = +this._web3.utils.fromWei(await this._web3.eth.getBalance(DonationWalletAddress), 'ether');
		const usdBalance: number = await this._usd.methods.balanceOf(DonationWalletAddress).call() * Math.pow(10, -(await this._usd.methods.decimals().call()));
		const raptorBalance: number = await this._raptor.methods.balanceOf(DonationWalletAddress).call() * Math.pow(10, -(await this._raptor.methods.decimals().call()));

		this._donationWalletBalance = usdBalance + (bnbBalance * prices.bnb.usd) + (raptorBalance * prices.raptor.usd);
		this._prices = prices;
	}

	public get donationWalletBalance(): number {
		return this._donationWalletBalance || 0;
	}
	public get raptorBnbPrice(): number {
		return (this._prices || {}).raptor.bnb;
	}
	public get raptorUsdPrice(): number {
		return (this._prices || {}).raptor.usd;
	}
	public get marketCapUsd(): number {
		return (this._prices || {}).marketCap.usd;
	}
	public get totalSupply(): number {
		return (this._prices || {}).totalSupply.value;
	}
	
	public usdToRaptor(usdAmount?: number): number {
		return (usdAmount/(this._prices || {}).raptor.usd);
	}
	
	public bnbToRaptor(bnbAmount?: number): number {
		return (bnbAmount/(this._prices || {}).raptor.bnb);
	}

	private async retrievePriceApi() {
		console.log("Retrieving prices...");
		return (await (await fetch("https://api.perseusoft.tech/raptoradmin/raptorservices/crypto/info/0x44c99ca267c2b2646ceec72e898273085ab87ca5")).json());
	}

	private async getPrices(force: boolean): PriceInfo {
		if (!!this._prices && !force) {
			return this._prices;
		}
		const a = await this.retrievePriceApi();
		return {
			raptor: {
				usd: a.lastPrices.raptorusd,
				bnb: a.lastPrices.raptorbnb,
			},
			bnb: {
				usd: a.lastPrices.raptorusd
			},
			marketCap: {
				usd: a.lastPrices.marketcapusd,
			},
			totalSupply: {
				value: a.totalSupply,
			}
		};
	}
}
