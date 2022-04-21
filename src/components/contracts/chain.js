import {Wallet} from '../wallet';
import {Raptor} from './raptor';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const CustodyAddressTestnet = "0xA9A78DA37ec5643C823559C5e773399452bf8d51";

export class RaptorChainInterface {
	private readonly wallet: Wallet;
	private readonly node: string;
	private readonly raptor: Raptor;
	private readonly _custody: Contract;
	private _balance: number;
	
	
	constructor(walletInstance: Wallet, nodeAddress: string) {
		this.wallet = walletInstance;
		this.node = nodeAddress;
		this.raptor = (new Raptor(this.wallet));
		this._custody = wallet.connectToContract(CustodyAddressTestnet, require('./custody.abi.json'));
		this._balance = 0;
	}
	
	convertFromHex(hex) {
		var hex = hex.toString();//force conversion
		var str = '';
		for (var i = 0; i < hex.length; i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	}

	convertToHex(str) {
		var hex = '';
		for(var i=0;i<str.length;i++) {
			hex += ''+str.charCodeAt(i).toString(16);
		}
		return hex;
	}
	
	async getCurrentEpoch() {
		return (await (await fetch(`${this.node}/chain/getlastblock`)).json()).result.miningData.proof;
	}
	
	async getAccountInfo(account) {
		return (await (await fetch(`${this.node}/accounts/accountInfo/${account}`)).json()).result;
	}
	
	async refresh() {
		this._balance = (await getAccountInfo(this.wallet.currentAddress)).balance;
	}

	async getHeadTx(account) {
		let accountInfo = (await getAccountInfo(account));
		return accountInfo.transactions[accountInfo.transactions.length-1];
	}

	async transferTx(to, tokens) { // shall return a valid transfer transaction (legacy way, aka non-web3)
		const parent = (await getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(to), "tokens":tokens, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": 0};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async createMNTx(operator) { // shall generate a masternode registration transaction
		const parent = (await getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(operator), "tokens": 0, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": 4};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async destroyMNTx(operator) { // shall generate a masternode destruction transaction (aka remove masternode and withdraw collateral)
		const parent = (await getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(operator), "tokens": 0, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": 5};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}

	async sendTransaction(signedTx) {
		console.log(signedTx);
		return (await (await fetch(`${this.node}/send/rawtransaction/?tx=${signedTx}`)).json()).result;
	}
	
	
	async crossChainDeposit(amount: number) {
		if (this.raptor.balance >= amount) {
			await this.raptor.contractv3.methods.approveAndCall(this._custody._address, web3.toWei(String(amount),'gwei'),"0x0").send({'from': this.wallet.currentAddress});
		}
		else {
			throw `Your balance isn't sufficient to migrate ${amount} raptors, maximum : ${this._balance}`;
		}
	}
	}
	
	sigToVRS(sig) {
		return (('0x' + sig.substring(2).substring(128, 130)), ('0x' + sig.substring(2).substring(0, 64)), ('0x' + sig.substring(2).substring(64, 128)))
	}
	
	get connectedNode() {
		return this.node;
	}
	
	get custodyContract() {
		return this._custody;
	}
	
	get balance() {
		return this._balance;
	}
}