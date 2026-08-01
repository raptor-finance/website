import {Wallet, Raptors} from '../wallet';
import {Raptor} from './raptor';
import {Contract} from 'web3-eth-contract';
import * as web3 from 'web3-utils';

import {
	CHAIN,
	CHAIN_HEX,
	CONTRACTS,
	BSC_CUSTODY_ADDRESS,
} from '../../config';
import { toRawUnits } from '../../utils/units';

export const CustodyAddressTestnet = CONTRACTS.CUSTODY_TESTNET;
export const CustodyAddressMainnet = CONTRACTS.CUSTODY_MAINNET;
export const BridgedAddressPolygon = Raptors[CHAIN.POLYGON];

export const BridgeHostAddress = CONTRACTS.BRIDGE_HOST[CHAIN.POLYGON];
export const BridgeHostAddresses = CONTRACTS.BRIDGE_HOST;

export class RaptorChainInterface {
	private readonly wallet: Wallet;
	private readonly node: string;
	private readonly raptor: Raptor;
	private readonly _custody: Contract;
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

	/**
	 * Build a signed RaptorChain transaction. All of transfer/faucet/masternode
	 * transactions share the same envelope: build data -> sha3 -> sign -> wrap.
	 */
	async buildSignedTx(to, tokens, type, callData?) { // shall return a valid signed transaction (legacy way, aka non-web3)
		const parent = (await this.getHeadTx(this.wallet.currentAddress));
		let data = {"from":this.wallet.currentAddress, "to":web3.toChecksumAddress(to), "tokens":tokens, "parent": parent, "epoch": (await this.getCurrentEpoch()),"type": type};
		if (callData) {
			data["callData"] = callData;
		}
		let strdata = JSON.stringify(data);
		const hash = web3.soliditySha3(strdata);
		const signature = (await this.wallet.sign(strdata));
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}

	async transferTx(to, tokens) {
		return this.buildSignedTx(to, tokens, 0);
	}
	
	async faucetClaimTx() {
		return this.buildSignedTx(CONTRACTS.FAUCET, 0, 0, "4e71d92d");
	}
	
	async createMNTx(operator) { // shall generate a masternode registration transaction
		return this.buildSignedTx(operator, 0, 4);
	}
	
	async destroyMNTx(operator) { // shall generate a masternode destruction transaction (aka remove masternode and withdraw collateral)
		return this.buildSignedTx(operator, 0, 5);
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
		const signedTx = (await this.transferTx(BSC_CUSTODY_ADDRESS, toRawUnits(amount)));
		const result = await this.sendTransaction(signedTx);
		if (!result) {
			throw 'The withdrawal transaction was rejected by the node.';
		}
	}
	
	// polygon-specific bridge code (kept until the mainnet page uses the chain-agnostic variants)
	async bridgeToPolygon(amount: number) {
		return this.bridgeTo(CHAIN.POLYGON, amount);
	}
	
	async initPolygonUnwrap(amount: number) {
		return this.initUnwrap(CHAIN.POLYGON, amount);
	}
	
	async finishPolygonUnwrap(slot) {
		return this.finishUnwrap(CHAIN.POLYGON, slot);
	}
	
	// chain-agnostic bridge code
	async bridgeTo(chainid: number, amount: number) {
		await this.wallet.switchNetwork(CHAIN.RAPTORCHAIN); // switch wallet to RaptorChain
		const _host = this.getBridgeHost(chainid);
		return await _host.methods.wrap().send({'from': this.wallet.currentAddress, amount, 'value': toRawUnits(amount)});
	}
	
	async initUnwrap(chainid: number, amount: number) {
		await this.wallet.switchNetwork(chainid); // switch wallet to Chain
		const _instance = this.getBridgedInstance(chainid);
		let receipt = await _instance.methods.unwrap(toRawUnits(amount)).send({'from': this.wallet.currentAddress});
		return receipt.events.UnWrap.returnValues.slotKey;
	}
	
	async finishUnwrap(chainid: number, slot) {
		await this.wallet.switchNetwork(CHAIN.RAPTORCHAIN); // switch wallet to RaptorChain
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
