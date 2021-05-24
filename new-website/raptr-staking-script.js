$(function() {

	const apr = 5;
	const contract = "0xf9a3fda781c94942760860fc731c24301c83830a";

	window.raptr = {
		connected: false,
		web3found: false,
		contract: null,
		wallet: null,
		update: null,
		currentBalances: {
			balance: 0,
			rewards: 0,
			staked: 0
		}
	};

	function ctr(w3) {
		return new w3.Contract([{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_newMinter","type":"address"}],"name":"AllowedMinter","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_newSwapper","type":"address"}],"name":"AllowedSwapper","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_revoked","type":"address"}],"name":"RevokedMinter","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_revoked","type":"address"}],"name":"RevokedSwapper","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"lockedForSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_address","type":"address"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"swapWasConfirmed","type":"event"},{"stateMutability":"nonpayable","type":"fallback"},{"inputs":[],"name":"_totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"allowBypassFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMinter","type":"address"}],"name":"allowMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newSwapper","type":"address"}],"name":"allowSwapper","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"cancelSwaps","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"cancelSwapsOf","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"chainSwappers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_apr","type":"uint256"}],"name":"changeAPR","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPercentage","type":"uint256"}],"name":"changeBurnRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPercentage","type":"uint256"}],"name":"changeFeeRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimStakingRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"disallowBypassFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBurnRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLastSender","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"getUserAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"isSwapper","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"lockForSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"lockForSwapTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mintTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"minterAccesses","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"pendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"pendingSwapsOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_revoked","type":"address"}],"name":"revokeMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_revoked","type":"address"}],"name":"revokeSwapper","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stakeIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"stakedBalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapConfirmed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFeeRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"}],contract);
	}

	function err(msg) {
		console.error(msg);
		alert(msg);
	}

	function setConnected(addr) {
		window.raptr.connected = true;
		window.raptr.wallet = addr;
		$('#staking-address').html(addr);
		$('#connect').hide();
		$('#disconnect').show();
		$('#disconnect a').text(addr);
		startUpdates();

	}

	function setDisconnected() {
		window.raptr.connected = false;
		window.raptr.wallet = null;
		$('#disconnect').hide();
		$('#connect').show();
		stopUpdates();
	}

	function connect() {
		if (!!window.ethereum) {
			window.ethereum.request({method:'eth_requestAccounts'}).then(function(receipt) {
				window.web3 = new Web3(window.ethereum);

				if (+window.web3.currentProvider.chainId === 56) {
					console.log("Detected BSC wallet. Proceeding!");
					window.raptr.contract = ctr(web3.eth);
					setConnected(receipt[0]);
				}
				else {
					err("RAPTOR staking is currently supported on Binance Smart Chain. Please make sure you have selected the right network.");
					setDisconnected();
				}
			});

			window.raptr.web3found = true;
		}
		else {
			err("No Web3 provider was detected. Please install a Wallet browser extension compatible with Binance Smart Chain such as Metamask.");
			window.raptr.web3found = false;
		}
	}

	async function stake() {
		const amount = +($('#stake-amount-todo').val());
		if (amount > 0) {
			const receipt = await window.raptr.contract.methods.balanceOf(window.raptr.wallet).call();
			if (receipt >= amount*(10**9)) {
				await window.raptr.contract.methods.stakeIn(web3.utils.toWei(String(amount),'gwei')).send({'from': window.raptr.wallet});
			} else {
				alert("Error: insufficient balance for this operation.")
			}
		}
		else {
			alert("Error: amount must be greater than zero.");
			return;
		}

		updateOnce();
	}

	async function unstake() {
		const amount = +($('#unstake-amount-todo').val());
		if (amount > 0) {
			const receipt = await window.raptr.contract.methods.stakedBalanceOf(window.raptr.wallet).call();

			if (receipt >= amount*(10**9)) {
				await window.raptr.contract.methods.withdrawStake(web3.utils.toWei(String(amount), 'gwei')).send({'from': window.raptr.wallet});
			} else {
				alert("Error: not enough tokens staked.");
				return;
			}
		}
		else {
			alert("Error: amount must be greater than zero.");
			return;
		}

		updateOnce();
	}
	
	async function claim() {
		await window.raptr.contract.methods.claimStakingRewards().send({'from': window.raptr.wallet});
	}

	function getStakingEstimations(staked) {
		return {
			daily: staked * apr / 36500,
			weekly: staked * apr * 7 / 36500,
			monthly: staked * apr / 1200,
		};
	}

	function dtoa(d,n) {
		return (d||0).toLocaleString({}, {
			style: 'decimal',
			useGrouping: true,
			minimumFractionDigits: n||0,
			maximumFractionDigits: n||0
		})
	}

	function updateCalculatedStakingRewards() {
		let calcStaked = +($('#staking-amount').val());
		if (isNaN(calcStaked)) {
			calcStaked = 0;
		}

		const est = getStakingEstimations(calcStaked);
		$('#staking-rewards-estimated').html(dtoa(est.weekly, 2));
	}

	function updateValues(callback) {
		var result = {
			balance: 0,
			rewards: 0,
			staked: 0
		};

		if (!window.raptr || !window.raptr.contract) {
			console.warn("Unable to get balances - no connection to network.")
			callback(result);
			return;
		}

		function bal(a) { result.balance = a||result.balance; }
		function rew(a) { result.rewards = a||result.rewards; }
		function stk(a) { result.staked = a||result.staked; }

		window.raptr.contract.methods.balanceOf(window.raptr.wallet)
			.call().then(function(a) { bal(a); window.raptr.contract.methods.pendingRewards(window.raptr.wallet)
			.call().then(function(a) { rew(a); window.raptr.contract.methods.stakedBalanceOf(window.raptr.wallet)
				.call().then(function(a) { stk(a); callback(result); })})});
	}

	function updateOnce() {
		updateValues(function(r) {

			console.log('Balance report', r);

			$('#stakedAmounts').text(dtoa(r.staked*0.000000001));
			$('#rewards').text(dtoa(r.rewards*0.000000001));
			$('#staking-balance').text(dtoa(r.balance*0.000000001));
			$('#staking-available').text(dtoa(r.balance*0.000000001));
			$('#unstaking-available').text(dtoa(r.staked*0.000000001));

			window.raptr.currentBalances = r;
		});
	}
	function startUpdates() {
		updateOnce();
		window.raptr.update = setTimeout(startUpdates, 20000);
	}

	function stopUpdates() {
		if (!!update) {
			clearTimeout(window.raptr.update);
			window.raptr.update = null;
		}
	}

	$('#connect').click(connect);

	if (!!window.ethereum) {
		connect();
	}

	$(function(){
		$('#staking-amount').keyup(function() {
			updateCalculatedStakingRewards();
		})

		$('#button-stake-max').click(function() {
			$('#stake-amount-todo').val(window.raptr.currentBalances.balance/(10**9));
		})

		$('#button-stake-confirm').click(function() {
			stake().then();
		})
		$('#button-addon2').click(function() {
			$('#unstake-amount-todo').val(window.raptr.currentBalances.staked/(10**9));
		})

		$('#button-unstake-confirm').click(function() {
			unstake().then();
		})
		
		$('#btn-harvest').click(function() {
			claim().then();
		})
	})
})
