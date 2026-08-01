import { RaptorAddressv3 } from './raptor';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import { RPC, CHAIN, BUSD_BSC } from '../../config';

export const RPTR_PRICE_URL = "https://explorer.raptorchain.io/RPTRPrice"

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

	private _prices?: PriceInfo = null;

	constructor() {
		this._web3 = new Web3(new Web3.providers.HttpProvider(RPC[CHAIN.BSC]));
		this._raptor = new this._web3.eth.Contract(require('./erc20.abi.json'), RaptorAddressv3);
	}

	public async refresh() {	
		this._prices = await this.getPrices(true);
	}

	/**
	 * Donation-wallet balance was never wired up (the computation is disabled);
	 * kept returning 0 because the home page still reads it.
	 */
	public get donationWalletBalance(): number {
		return 0;
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
	
	/**
	 * Convert a USD amount into RPTR. Returns 0 when the price is unknown
	 * instead of dividing by zero (which produced Infinity before).
	 */
	public usdToRaptor(usdAmount?: number): number {
		const _price = (this._prices || {}).raptor?.usd;
		return _price ? (usdAmount / _price) : 0;
	}
	
	/** Same as `usdToRaptor` but using the RPTR/BNB price. */
	public bnbToRaptor(bnbAmount?: number): number {
		const _price = (this._prices || {}).raptor?.bnb;
		return _price ? (bnbAmount / _price) : 0;
	}

	private async getPrices(force: boolean): PriceInfo {
		if (!!this._prices && !force) {
			return this._prices;
		}
		
		let RPTRBNB;
		let RPTRBUSD;
		let bnbPrice;
		
		
		
		let _RPTRBUSDPromise = fetch(RPTR_PRICE_URL);
		let _BNBBUSDPROMISE = fetch("https://api.app-mobula.com/api/1/market/data?asset=bnb");

		try {
			RPTRBUSD = Number(await (await _RPTRBUSDPromise).text()); // batch-sending requests before awaiting them is more latency-efficient
		} catch (e) {
			RPTRBUSD = 0;
		}
		
		try {
			bnbPrice = (await (await _BNBBUSDPROMISE).json()).price;
			RPTRBNB = RPTRBUSD / bnbPrice;
		} catch (e) {
			// since bnbPrice is denominator, it has to be set here in case bnb price can't be fetched OR if it's zero (triggers catch too)
			bnbPrice = 0;
			RPTRBNB = 0;
		}
		
		const _totalSupply = this._web3.utils.fromWei(await this._raptor.methods.totalSupply().call());
		return {
			raptor: {
				usd: RPTRBUSD,
				bnb: RPTRBNB
			},
			bnb: {
				usd: bnbPrice
			},
			marketCap: {
				usd: RPTRBUSD*_totalSupply,
			},
			totalSupply: {
				value: _totalSupply,
			}
		};
	}
}
