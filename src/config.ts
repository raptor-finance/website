/**
 * Central chain / token / contract configuration.
 *
 * All chain ids, hex chain ids, RPC urls, token addresses and contract addresses
 * that used to be hardcoded across the codebase live here. Import from this module
 * instead of scattering literals around.
 */

// ---------------------------------------------------------------------------
// Chain ids (decimal)
// ---------------------------------------------------------------------------
export const CHAIN = {
	BSC: 56,
	BSC_TESTNET: 97,
	POLYGON: 137,
	FANTOM: 250,
	RAPTORCHAIN: 1380996178, // RaptorChain mainnet
	RAPTORCHAIN_TESTNET: 499597202514,
};

// ---------------------------------------------------------------------------
// Chain ids (EIP-3085 hex format, for wallet_addEthereumChain)
// ---------------------------------------------------------------------------
export const CHAIN_HEX = {
	[CHAIN.BSC]: '0x38',
	[CHAIN.BSC_TESTNET]: '0x61',
	[CHAIN.POLYGON]: '0x89',
	[CHAIN.FANTOM]: '0xfa',
	[CHAIN.RAPTORCHAIN]: '0x52505452', // "RPTR" in ascii
	[CHAIN.RAPTORCHAIN_TESTNET]: '0x7452505452', // "tRPTR" in ascii
};

// ---------------------------------------------------------------------------
// RPC urls
// ---------------------------------------------------------------------------
export const RPC = {
	[CHAIN.BSC]: 'https://bsc-dataseed3.binance.org/',
	[CHAIN.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
	[CHAIN.POLYGON]: 'https://polygon-rpc.com/',
	[CHAIN.FANTOM]: 'https://rpc.ftm.tools/',
	[CHAIN.RAPTORCHAIN]: 'https://rpc.raptorchain.io/web3',
	[CHAIN.RAPTORCHAIN_TESTNET]: 'https://rpc-testnet.raptorchain.io/web3',
};

/** RPC urls keyed by hex chain id (used by the WalletConnect provider options). */
export const RPC_HEX = {
	[CHAIN_HEX[CHAIN.BSC]]: RPC[CHAIN.BSC],
};

// ---------------------------------------------------------------------------
// Native currency / block explorer metadata
// ---------------------------------------------------------------------------
export const CHAIN_META = {
	[CHAIN.BSC]: {
		chainName: 'Binance Smart Chain',
		nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
		rpcUrls: [RPC[CHAIN.BSC]],
		blockExplorerUrls: ['https://bscscan.com/'],
	},
	[CHAIN.BSC_TESTNET]: {
		chainName: 'Binance Smart Chain Testnet',
		nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
		rpcUrls: [RPC[CHAIN.BSC_TESTNET]],
		blockExplorerUrls: ['https://testnet.bscscan.com/'],
	},
	[CHAIN.POLYGON]: {
		chainName: 'Polygon',
		nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
		rpcUrls: [RPC[CHAIN.POLYGON]],
		blockExplorerUrls: ['https://polygonscan.com/'],
	},
	[CHAIN.FANTOM]: {
		chainName: 'Fantom',
		nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
		rpcUrls: [RPC[CHAIN.FANTOM]],
		blockExplorerUrls: ['https://ftmscan.com/'],
	},
	[CHAIN.RAPTORCHAIN]: {
		chainName: 'RaptorChain',
		nativeCurrency: { name: 'RPTR', symbol: 'RPTR', decimals: 18 },
		rpcUrls: [RPC[CHAIN.RAPTORCHAIN]],
		blockExplorerUrls: ['https://explorer.raptorchain.io/'],
	},
	[CHAIN.RAPTORCHAIN_TESTNET]: {
		chainName: 'RaptorChain Testnet',
		nativeCurrency: { name: 'tRPTR', symbol: 'tRPTR', decimals: 18 },
		rpcUrls: [RPC[CHAIN.RAPTORCHAIN_TESTNET]],
		blockExplorerUrls: ['https://explorer-testnet.raptorchain.io/'],
	},
};

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
/** RPTR token address per chain (v3). */
export const RPTR_TOKEN = {
	[CHAIN.BSC]: '0x44C99Ca267C2b2646cEEc72e898273085aB87ca5',
	[CHAIN.POLYGON]: '0x94f405FB408Ad743418d10f4926cb9cdb53b2ef7',
	[CHAIN.FANTOM]: '0x50956f965F321c1DE62d2E103620881597d76809',
};

/** RPTR (v2) on BSC mainnet — the token that gets migrated to v3. */
export const RPTR_V2_BSC = '0xf9A3FdA781c94942760860fc731c24301c83830A';

/** RPTR (v3) on the BSC testnet (used by the cross-chain testnet flow). */
export const RPTR_TESTNET_BSC = '0xC64518Fb9D74fabA4A748EA1Db1BdDA71271Dc21';

export const WBNB_BSC = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
export const W_RPTR = '0xeF7cADE66695f4cD8a535f7916fBF659936818C4'; // Wrapped RPTR on the swap

/** The token used as the stablecoin reference on BSC. */
export const BUSD_BSC = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------
export const CONTRACTS = {
	RAPTOR_FARM_OLD: '0x540647470C039dD7c93b2dfe328264d1a56e3074',
	RAPTOR_FARM_NEW: '0xA21F55B2195aF7942B33372aF8a078F3c22f9F75',
	RAPTOR_LOTTERY: '0xB821d7e7a545Df0c64ED19Ae05cf86F231cb063F',
	RAPTOR_SWAP_FACTORY: '0xB8F7aAdaC20Cd74237dDAB7AC7ead317BF049Fa3',
	RAPTOR_SWAP_ROUTER: '0x397D194abF71094247057642003EaCd463b7931f',
	CUSTODY_MAINNET: '0x6a200e1aA7D31F17211CD569C788Ac1d3Ab1B9f9',
	CUSTODY_TESTNET: '0x121C64598b58318cFF4cD9AB8a209F9537dCAe0d',
	FAUCET: '0xE939B52727e35Cf1798D9b06241Bb2fe7881D845',
	YOUR_TOKEN_DEPLOYER: '0x1506abf34029a9F56605A8e2334484222564f25E',
	BRIDGE_HOST: {
		[CHAIN.POLYGON]: '0xa09D1c8A7486Aa19A92e044c8f7a922B85FCe3Fc',
		[CHAIN.FANTOM]: '0x47FbA14C31F50cAe1cFb061f157E8B5CD0796c2c',
	},
};

/** Cross-chain custody target used when withdrawing back to BSC. */
export const BSC_CUSTODY_ADDRESS = '0x0000000000000000000000000000000000000097';

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export const DONATION_WALLET = '0xf933DB8A663FdE971FA95c4a2bfb4fC3F797F8a5';

export const EVM_MAX_UINT256 =
	'115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const STABLE_COINS_BSC = [
	'0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
	'0x55d398326f99059fF775485246999027B3197955', // USDT
	'0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
	'0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // DAI
	'0x23396cF899Ca06c4472205fC903bDB4de249D6fC', // UST
];
