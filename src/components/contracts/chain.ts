import {Wallet, Raptors} from '../wallet';
import {Raptor} from './raptor';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';

export const CustodyAddressTestnet = "0x121C64598b58318cFF4cD9AB8a209F9537dCAe0d";
export const CustodyAddressMainnet = "0x6a200e1aA7D31F17211CD569C788Ac1d3Ab1B9f9";
export const BridgedAddressPolygon = "0x94f405FB408Ad743418d10f4926cb9cdb53b2ef7";

export const BridgeHostAddress = "0xa09D1c8A7486Aa19A92e044c8f7a922B85FCe3Fc";
export const BridgeHostAddresses = {137: "0xa09D1c8A7486Aa19A92e044c8f7a922B85FCe3Fc", 250: "0x47FbA14C31F50cAe1cFb061f157E8B5CD0796c2c"};

export class RaptorChainInterface {
	private readonly wallet: Wallet;
	private readonly node: string;
	private readonly raptor: Raptor;
	private readonly _custody: Contract;
	private readonly _bridgedtoken: Contract;
	private readonly _bridgeHost: Contract;
	private _balance: number;
	
	private _mainnet: boolean;
	
	constructor(walletInstance: Wallet, nodeAddress: string, mainnet?: boolean) {
		this.wallet = walletInstance;
		this.node = nodeAddress;
		this._mainnet = mainnet;
		this.connectContracts();
	}
	
	connectContracts() {
		this.raptor = (new Raptor(this.wallet));
		this._custody = this._mainnet ? this.wallet.connectToContract(CustodyAddressMainnet, require('./custody.abi.json')) : this.wallet.connectToContract(CustodyAddressTestnet, require('./custody.abi.json'));
		// } else if (this.wallet.chainId == 137) {
			// this._bridgedtoken = this.wallet.connectToContract(BridgedAddressPolygon, require('./bridgedRaptor.abi.json'));
		// } else if (this.wallet.chainId == 137) {
			// this._bridgeHost = this.wallet.connectToContract(BridgeHostAddress, require('./bridgedRaptor.abi.json'));
		// }
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
		this._balance = (await this.getAccountInfo(this.wallet.currentAddress)).balance;
	}

	async getHeadTx(account) {
		let accountInfo = (await this.getAccountInfo(account));
		return accountInfo.transactions[accountInfo.transactions.length-1];
	}

	async transferTx(to, tokens) { // shall return a valid transfer transaction (legacy way, aka non-web3)
		const parent = (await this.getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(to), "tokens":tokens, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": 0};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async faucetClaimTx() {
		const parent = (await this.getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress("0xE939B52727e35Cf1798D9b06241Bb2fe7881D845"), "tokens":0, "parent": parent, "epoch": (await this.getCurrentEpoch()), "callData": "4e71d92d", "type": 0};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async createMNTx(operator) { // shall generate a masternode registration transaction
		const parent = (await this.getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(operator), "tokens": 0, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": 4};
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async destroyMNTx(operator) { // shall generate a masternode destruction transaction (aka remove masternode and withdraw collateral)
		const parent = (await this.getHeadTx(this.wallet.currentAddress));
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
		await this.raptor.refresh();
		if (Number(this.raptor.balancev3) >= Number(amount)) {
			await this.raptor.contractv3.methods.approveAndCall(this._custody._address, web3.toWei(String(amount)),"0x0").send({'from': this.wallet.currentAddress});
		}
		else {
			throw `Your balance isn't sufficient to deposit ${amount} raptors, maximum : ${this.raptor.balancev3}`;
		}
	}
	
	getBridgeHost(chainid: number) {
		const _addr = BridgeHostAddresses[chainid];
		console.log(_addr);
		return this.wallet.connectToContract(_addr, require('./bridgeHost.abi.json'));
	}
	
	getBridgedInstance(chainid: number) {
		return this.wallet.connectToContract(Raptors[chainid], require("./bridgedRaptor.abi.json"));
	}
	
	async crossChainWithdrawal(amount: number) {
		const signedTx = (await this.transferTx("0x0000000000000000000000000000000000000097", web3.toWei(String(amount))));
		await this.sendTransaction(signedTx);
	}
	
	// polygon-specific code
	async bridgeToPolygon(amount: number) {
		await this.wallet.switchNetwork(0x52505452); // switch wallet to RaptorChain
		const _host = this.getBridgeHost(137);
		console.log(_host);
		return await _host.methods.wrap().send({'from': this.wallet.currentAddress, amount, 'value': web3.toWei(String(amount))});
	}
	
	async initPolygonUnwrap(amount: number) {
		await this.wallet.switchNetwork(137); // switch wallet to Polygon
		const _instance = this.getBridgedInstance(137);
		let receipt = await _instance.methods.unwrap(web3.toWei(String(amount))).send({'from': this.wallet.currentAddress});
		console.log(receipt);
		return receipt.events.UnWrap.returnValues.slotKey;
	}
	
	async finishPolygonUnwrap(slot) {
		await this.wallet.switchNetwork(0x52505452); // switch wallet to RaptorChain
		const _host = this.getBridgeHost(137);
		return await _host.methods.unwrap(slot).send({'from': this.wallet.currentAddress});
	}
	
	// chain-agnostic code
	async bridgeTo(chainid: number, amount: number) {
		await this.wallet.switchNetwork(0x52505452); // switch wallet to RaptorChain
		const _host = this.getBridgeHost(chainid);
		console.log(_host);
		return await _host.methods.wrap().send({'from': this.wallet.currentAddress, amount, 'value': web3.toWei(String(amount))});
	}
	
	async initUnwrap(chainid: number, amount: number) {
		console.log(chainid);
		await this.wallet.switchNetwork(chainid); // switch wallet to Chain
		const _instance = this.getBridgedInstance(chainid);
		let receipt = await _instance.methods.unwrap(web3.toWei(String(amount))).send({'from': this.wallet.currentAddress});
		console.log(receipt);
		return receipt.events.UnWrap.returnValues.slotKey;
	}
	
	async finishUnwrap(chainid: number, slot) {
		console.log(chainid);
		console.log(slot);
		await this.wallet.switchNetwork(0x52505452); // switch wallet to RaptorChain
		const _host = this.getBridgeHost(chainid);
		return await _host.methods.unwrap(slot).send({'from': this.wallet.currentAddress});
	}
	
	
	sigToVRS(sig) {
		return (('0x' + sig.substring(2).substring(128, 130)), ('0x' + sig.substring(2).substring(0, 64)), ('0x' + sig.substring(2).substring(64, 128)));
	}
	
	get connectedNode() {
		return this.node;
	}
	
	get custodyContract() {
		return this._custody;
	}
	
	get balance() {
		return (this._balance/10**18);
	}
}
