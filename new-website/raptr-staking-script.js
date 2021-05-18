xhr = new XMLHttpRequest();

function initWeb3() {
	if(typeof window.ethereum !== "undefined") {
		var metamaskInstalled = true;
		window.ethereum.request({method:'eth_requestAccounts'}).then(function (receipt) {
			currentAddress = receipt[0];
			window.web3 = new Web3(window.ethereum);
			document.getElementById("addresslabel").innerHTML = currentAddress;
			if (web3.currentProvider.chainId == 56) {
			  console.log("Correctly connected to BSC");
			  RAPTR = new web3.eth.Contract([{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_newMinter","type":"address"}],"name":"AllowedMinter","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_newSwapper","type":"address"}],"name":"AllowedSwapper","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_revoked","type":"address"}],"name":"RevokedMinter","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_revoked","type":"address"}],"name":"RevokedSwapper","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"lockedForSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_address","type":"address"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"swapWasConfirmed","type":"event"},{"stateMutability":"nonpayable","type":"fallback"},{"inputs":[],"name":"_totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"allowBypassFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMinter","type":"address"}],"name":"allowMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newSwapper","type":"address"}],"name":"allowSwapper","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"cancelSwaps","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"cancelSwapsOf","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"chainSwappers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_apr","type":"uint256"}],"name":"changeAPR","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPercentage","type":"uint256"}],"name":"changeBurnRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPercentage","type":"uint256"}],"name":"changeFeeRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimStakingRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"disallowBypassFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBurnRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLastSender","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"getUserAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"isSwapper","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"lockForSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"lockForSwapTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mintTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"minterAccesses","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"pendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"pendingSwapsOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_revoked","type":"address"}],"name":"revokeMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_revoked","type":"address"}],"name":"revokeSwapper","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stakeIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"}],"name":"stakedBalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_guy","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"swapConfirmed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFeeRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"}],"0xf9a3fda781c94942760860fc731c24301c83830a");
			  window.correctRpc = true;
			  refreshBalances();
			  document.getElementById("networklabel").innerHTML = "Network : Binance Smart Chain, <i>Only RAPTOR on Smart Chain is shown</i>";
			}
			else {
			  alert("Error: Current Chain ID is " + web3.currentProvider.chainId + ".<br> Please switch to Binance Smart Chain or Fantom Opera Network and refresh the page!");
			  document.getElementById("networklabel").innerHTML = "Network : Unsupported network detected!";
			  window.correctRpc = false;
			}
		})
	  } else {
			alert("Application Error: you currently do not have a supported Web3 wallet installed! Please install either Metamask or Trustwallet and try again!");
			document.getElementById("networklabel").innerHTML = "No Network : You do not have a Web3 Wallet installed please consider installing one!";
			window.metamaskInstalled = false;
	  }
}

function estimateStaking(amount) {
	document.getElementById("dailyrewards").innerHTML = String((amount*5)/36500);
	document.getElementById("weeklyrewards").innerHTML = String((amount*35)/36500);
	document.getElementById("monthlyrewards").innerHTML = String((amount*5)/1200)
}


function expectedRewards(amount) {
	document.getElementById("calcdailyrewards").innerHTML = String((amount*5)/36500);
	document.getElementById("calcweeklyrewards").innerHTML = String((amount*35)/36500);
	document.getElementById("calcmonthlyrewards").innerHTML = String((amount*5)/1200)
}

function calculaterewards() {
	expectedRewards(document.getElementById("askamountforcalc").value);
}

function refreshBalances() {
	RAPTR.methods.balanceOf(currentAddress).call().then(showbalance);
	RAPTR.methods.pendingRewards(currentAddress).call().then(showpendingrewards);
	RAPTR.methods.stakedBalanceOf(currentAddress).call().then(function (receipt) {
		showstakedbalance(receipt);
		estimateStaking(receipt/(10**9));
	});
 }


function stakeInBackend(amount) {
	if (amount > 0) {
	  RAPTR.methods.balanceOf(currentAddress).call().then(function (receipt) {
		if (receipt >= amount*(10**9)) {RAPTR.methods.stakeIn(web3.utils.toWei(String(amount),'gwei')).send({'from': currentAddress}).then(refreshBalances);} else {alert("Error, unsufficient balance...")}
	  })
	}
	else {
	  alert("0 amount, it shall be positive");
	}
	  RAPTR.methods.balanceOf(currentAddress).call().then(showbalance);
	 RAPTR.methods.stakedBalanceOf(currentAddress).call().then(showstakedbalance);
  }

function stakeOutBackend(amount) {
	if (amount > 0) {
		RAPTR.methods.stakedBalanceOf(currentAddress).call().then(function (receipt) {
		if (receipt >= amount*(10**9)) {RAPTR.methods.withdrawStake(web3.utils.toWei(String(amount), 'gwei')).send({'from': currentAddress}).then(refreshBalances);} else {alert("Error, not enough to unstake...")}
		})
	}
	else {
		alert("0 amount, it shall be positive");
	}
}

function stakeOutFront() {
	stakeOutBackend(document.getElementById("askamount").value);
}

function claimRewards() {
	RAPTR.methods.claimStakingRewards().send({'from': currentAddress}).then(refreshBalances);
}


function stakeInFront() {
	stakeInBackend(document.getElementById("askamount").value);
}
function showbalance(amount) {
	console.log("showing balance");
	if(correctRpc) {
		document.getElementById("balancelabel").innerHTML = amount/(10**9);
	}
	else if (metamaskInstalled) {
	  document.getElementById("balancelabel").innerHTML = "Wrong RPC, please switch to BSC";
	}
	else {
		document.getElementById("balancelabel").innerHTML = "Install Metamask or any other web3 compatible wallet !";
	}
}

	  function showstakedbalance(amount) {
		console.log("showing balance");
		if(correctRpc) {
		  stakedbalance = amount/(10**18);
		  document.getElementById("stakedbalancelabel").innerHTML = amount/(10**9);
		}
		else if (metamaskInstalled) {
		  stakedbalance = 0;
		  document.getElementById("stakedbalancelabel").innerHTML = "Wrong RPC, please switch to BSC";
		}
		else {
		  stakedbalance = 0;
		  document.getElementById("stakedbalancelabel").innerHTML = "Install Metamask or any other web3 compatible wallet !";
		}
	  }

	  function showpendingrewards(amount) {
		console.log("showing balance");
		if(correctRpc) {
		  document.getElementById("pendingrewardslabel").innerHTML = amount/(10**9);
		}
		else if (metamaskInstalled) {
		  document.getElementById("pendingrewardslabel").innerHTML = "Wrong RPC, please switch to BSC";
		}
		else {
		  document.getElementById("pendingrewardslabel").innerHTML = "Install Metamask or any other web3 compatible wallet !";
		}
	  }
	  initWeb3()
