<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name=viewport content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Lottery</title>
    <link rel="icon"
          type="image/png"
          href="/images/lsolo-logo.svg">
    <link rel="stylesheet" href="https://raptr.finance/new-website/src/app.css">
    <link rel="stylesheet" href="https://raptr.finance/new-website/src/media.css">
</head>
<body>


<main class="main-wrapper">


    <div class="navigation-wrapper">

        <div class="logo-wrapper">
            <img src="https://raptr.finance/new-website/images/logo.svg" class="img-logo">
            <button class="navbar-toggler" type="button" data-target="#left-navbar"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="iconify" data-icon="bi:list" data-inline="false"></span>
            </button>
        </div>

    <?php include_once("nav.php"); ?>
    
    </div>

    <div class="content-wrapper">
        <div class="container-fluid">
            <div class="lottery-container">
                <div class="row">
                    <div class="col-12 col-lg-10">

                        <img src="https://raptr.finance/new-website/images/lottery.svg" class="mb-3" width="250">
                        <div>
                            <p class="text-white">
                                This is a simple, non-custodial Proof of Work Random Number Generation <br>
                                Lottery for RAPTRs to easily purchase Philosoraptor Lottery Tickets!
                            </p>
                            <p class="text-white">
                                You need to be connected to the Binance Smart Chain to play in our <br>
                                lotteries!!
                            </p>
                        </div>
                        <div>
                            <div class="row">
                            <div class="col-12 col-md-6 col-lg-6">
                                    <div class="card card-rounded-x2  overflow-hidden mt-3 gradient-green-blue">
                                        <div class="card-body p-5 text-left">
                                            <div>
                                                <h4 class="text-dark font-weight-bold">Your Information</h4>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Address</strong>
                                                <div id="addresslabel" class="text-dark-light small">Connect your wallet for that</div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Balance</strong>
                                                <div id="balancelabel" class="text-dark-light">Something... maybe</div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Tickets balance</strong>
                                                <div id="ticketslabel" class="text-dark-light">I hope u has some tickets</div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Ticket Price:</strong>
                                                <div class="text-dark font-weight-bold">1,000,000,000 Raptor Token</div>
                                            </div>

                                            <div class="mt-3">
                                                <div>
                                                    <a onclick="buyTicket()" class="btn btn-dark btn-block">Purchase a ticket</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <div class="col-12 col-md-6 col-lg-6">
                                    <div class="card card-rounded-x2  overflow-hidden mt-3 gradient-green-red">
                                        <div class="card-body p-5 text-left">
                                            <div>
                                                <h4 class="text-dark font-weight-bold">Current Jackpot</h4>
                                            </div>

                                            <div class="mt-5">
                                                <strong class="text-dark">Winner of last round</strong>
                                                <div id="lastwinnerlabel" class="text-dark-light">Someone</div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Current jackpot</strong>
                                                <div id="jackpotlabel" class="text-dark-light">something</div>
                                            </div>
                                            <div class="mt-3 mb-4">
                                                <strong class="text-dark">Total tickets for this round</strong>
                                                <div id="totalticketslabel" class="text-dark-light">An amount</div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="main-nav-overlay" aria-expanded="false"></div>
</main>

<script src="https://code.iconify.design/1/1.0.7/iconify.min.js"></script>
<script src="https://raptr.finance/new-website/jquery.min.js"></script>
<script src="https://raptr.finance/new-website//web3.min.js"></script>
<script src="https://raptr.finance/new-website/bootstrap.min.js"></script>
<script>
  function showTicketsBalance(amount) {
    document.getElementById("ticketslabel").innerHTML = new Intl.NumberFormat().format(amount);
  }

  function showTokenBalance(amount) {
    document.getElementById("balancelabel").innerHTML = new Intl.NumberFormat().format(amount/(10**9))
  }

  function showJackpot(amount) {
    document.getElementById("jackpotlabel").innerHTML = new Intl.NumberFormat().format(amount/(10**9))
  }

  function refreshBalances() {
    RAPTOR.methods.balanceOf(currentAddress).call().then(showTokenBalance);
    lotteryContract.methods.ticketBalanceOf(currentAddress).call().then(showTicketsBalance);
    lotteryContract.methods.currentJackpot().call().then(showJackpot);
	showTotalTickets();
	getLastWinner();
  }

  async function getTotalTickets() {
	return (await lotteryContract.methods.ticketsPerRound((await lotteryContract.methods.currentDraw().call())).call());
  }

async function getLastWinner() {
	document.getElementById("lastwinnerlabel").innerHTML = await lotteryContract.methods.winnerOfRound((await lotteryContract.methods.currentDraw().call()) - 1).call()
}

  async function showTotalTickets() {
	document.getElementById("totalticketslabel").innerHTML = (await getTotalTickets())
  }


  async function purchaseTicket() {
	receipt = await lotteryContract.methods.getTicket().send({'from':currentAddress});
	refreshBalances();
	alert("Successfully purchased ticket, hash : " + receipt.events.NewTicket.returnValues.hash)
	}


  async function buyTicket() {
    if (await RAPTOR.methods.balanceOf(currentAddress).call() >= (10**18)) {
		if (Number(await RAPTOR.methods.allowance(currentAddress, lotteryAddress).call()) < (10**18)) {
			await RAPTOR.methods.approve(lotteryAddress, (BigInt(2**256) - BigInt(1)).toString()).send({'from':currentAddress});
		}
		refreshBalances();
		purchaseTicket();
	}
    else {
        alert("Insufficient RAPTOR balance!")
    }
  }


  if(typeof window.ethereum !== "undefined") {
    var metamaskInstalled = true;
    window.ethereum.enable().then(function (receipt) {
      currentAddress = receipt[0];
      window.web3 = new Web3(window.ethereum);
      document.getElementById("addresslabel").innerHTML = currentAddress;
      if (web3.currentProvider.chainId == 56) {
        console.log("Correctly connected to BSC");
        window.correctRpc = true;
        RAPTOR = new web3.eth.Contract([{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minTokensBeforeSwap","type":"uint256"}],"name":"MinTokensBeforeSwapUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokensSwapped","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethReceived","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokensIntoLiqudity","type":"uint256"}],"name":"SwapAndLiquify","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"}],"name":"SwapAndLiquifyEnabledUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"_liquidityFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_maxTxAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_taxFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"}],"name":"deliver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"enableTrading","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"excludeFromFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"excludeFromReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"geUnlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"includeInFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"includeInReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isExcludedFromFee","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isExcludedFromReward","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"time","type":"uint256"}],"name":"lock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"},{"internalType":"bool","name":"deductTransferFee","type":"bool"}],"name":"reflectionFromToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"liquidityFee","type":"uint256"}],"name":"setLiquidityFeePercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxTxPercent","type":"uint256"}],"name":"setMaxTxPercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_enabled","type":"bool"}],"name":"setSwapAndLiquifyEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"taxFee","type":"uint256"}],"name":"setTaxFeePercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"swapAndLiquifyEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rAmount","type":"uint256"}],"name":"tokenFromReflection","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tradingEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"uniswapV2Pair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniswapV2Router","outputs":[{"internalType":"contract IUniswapV2Router02","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unlock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}],"0xf9A3FdA781c94942760860fc731c24301c83830A");
        lotteryContract = new web3.eth.Contract([{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":true,"internalType":"uint256","name":"roundNumber","type":"uint256"}],"name":"NewRound","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"round","type":"uint256"},{"indexed":true,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"player","type":"address"}],"name":"NewTicket","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"CAKE","outputs":[{"internalType":"contract ERC20Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CakeCompounder","outputs":[{"internalType":"contract PancakeSwapInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RAPTOR","outputs":[{"internalType":"contract ERC20Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"allTimeTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakeEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakeToOwnerPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"chainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"changeCakeOwnerPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"changeTicketPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentChallenge","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentDraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentJackpot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"drawPrize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTicket","outputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lastDraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"receiveApproval","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reinvestPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"setFeeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"percentage","type":"uint256"}],"name":"setReinvestPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stakeInCake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stakeOutCake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"ticketBalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ticketPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"ticketsPerDraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"ticketsPerRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"state","type":"bool"}],"name":"toggleCake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalTicketsMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"winnerOfRound","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}],"0x5f92528114E795A04C8A16d16CD594080B96103A")
        lotteryAddress = "0x5f92528114E795A04C8A16d16CD594080B96103A";
        refreshBalances();
      }
      else {
        alert("Error, current chainId is " + web3.currentProvider.chainId + ", please switch to BSC and refresh this page");
        document.getElementById("networklabel").innerHTML = "Network : Unsupported network detected";
        window.correctRpc = false;
      }
    })
    } else {
      window.metamaskInstalled = false;
      alert("Error: You should install a web3-compatible wallet first !");
    }
</script>

</body>
</html>
