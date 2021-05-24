<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name=viewport content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Lottery</title>
    <link rel="icon"
          type="image/png"
          href="/images/lsolo-logo.svg">
    <link rel="stylesheet" href="https://raptr.finance/src/app.css">
    <link rel="stylesheet" href="https://raptr.finance/src/media.css">
</head>
<body>


<main class="main-wrapper">


    <div class="navigation-wrapper">

        <div class="logo-wrapper">
            <img src="https://raptr.finance/images/logo.svg" class="img-logo">
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

                        <img src="https://raptr.finance/images/lottery.svg" class="mb-3" width="250">
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
<script src="https://raptr.finance/jquery.min.js"></script>
<script src="https://raptr.finance/web3.min.js"></script>
<script src="https://raptr.finance/bootstrap.min.js"></script>
<script src="https://raptr.finance/lotteryWeb3.min.js"></script>

</body>
</html>
