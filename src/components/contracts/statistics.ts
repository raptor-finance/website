import * as $ from "jquery";
import axios from "axios";
import {RaptorAddress, DonationWalletAddress} from "./raptor";
import Web3 from "web3";
import {Contract} from "web3-eth-contract";

type PriceInfo = { raptor: {usd: number, bnb: number}, bnb: {usd: number} }

export class RaptorStatistics {

	private readonly _web3: Web3;
	private readonly _raptor: Contract;
	private readonly _usd: Contract;

	private _prices?:  PriceInfo = null;
	private _donationWalletBalance?: number;

	constructor() {

		const erc20: any = [
			{
				"constant":true,
				"inputs":[{"name":"_owner","type":"address"}],
				"name":"balanceOf",
				"outputs":[{"name":"balance","type":"uint256"}],
				"type":"function"
			},
			{
				"constant":true,
				"inputs":[],
				"name":"decimals",
				"outputs":[{"name":"","type":"uint8"}],
				"type":"function"
			}
		];

		this._web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
		this._usd = new this._web3.eth.Contract(erc20,"0xe9e7cea3dedca5984780bafc599bd69add087d56");
		this._raptor = new this._web3.eth.Contract(erc20,RaptorAddress);
	}

	public async refresh() {
		const prices: PriceInfo = await this.getPrices(false);

		const bnbBalance: number = +this._web3.utils.fromWei(await this._web3.eth.getBalance(DonationWalletAddress), 'ether');
		const usdBalance: number = await this._usd.methods.balanceOf(DonationWalletAddress).call() * Math.pow(10, -(await this._usd.methods.decimals().call()));
		const raptorBalance: number = await this._raptor.methods.balanceOf(DonationWalletAddress).call() * Math.pow(10, -(await this._raptor.methods.decimals().call()));

		this._donationWalletBalance = usdBalance + bnbBalance * prices.bnb.usd + raptorBalance * prices.raptor.usd;
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

	private getPrices(force: boolean): Promise<PriceInfo> {
		if (!!this._prices && !force) {
			const prices = this._prices;
			return new Promise<PriceInfo>(function(res){res(prices)});
		}
		return new Promise<PriceInfo>(function(res,rej) {
			axios.get('https://glacial-eyrie-20564.herokuapp.com/https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=RAPTOR&convert=USD', {
				headers: {
					'X-CMC_PRO_API_KEY': "82a29d31-29f1-4ba6-80b7-5f21909c1c67",
					'Content-Type': 'application/json'
				}
			})
			.then(function(a){
				axios.get('https://glacial-eyrie-20564.herokuapp.com/https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=RAPTOR&convert=BNB', {
					headers: {
						'X-CMC_PRO_API_KEY': "82a29d31-29f1-4ba6-80b7-5f21909c1c67",
						'Content-Type': 'application/json'
					}
				})
				.then(function(b){
					res({
						raptor: {
							usd: a.data.data.RAPTOR.quote.USD.price||0,
							bnb: b.data.data.RAPTOR.quote.BNB.price||0
						},
						bnb: {
							usd: a.data.data.RAPTOR.quote.USD.price||0
						}
					});
				});
			});
			
			// $.get({
			// 	url: 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,raptor-finance&vs_currencies=usd,bnb',
			// 	dataType: 'json',
			// 	success: function(a) {
					
			// 		res({
			// 			raptor: {
			// 				usd: (a['raptor-finance']||{}).usd||0,
			// 				bnb: (a['raptor-finance']||{}).bnb||0
			// 			},
			// 			bnb: {
			// 				usd: (a['binancecoin']||{}).usd||0
			// 			}
			// 		});
			// 	},
			// 	error: function(err) {
			// 		rej(err);
			// 	}
			// });
		})
	}
}
