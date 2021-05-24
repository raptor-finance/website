
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name=viewport content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Staking</title>
    <link rel="icon"
          type="image/png"
          href="https://raptr.finance/images/lsolo-logo.svg">
    <link rel="stylesheet" href="https://raptr.finance/new-website/src/app.css">
    <link rel="stylesheet" href="https://raptr.finance/new-website/src/media.css">
    <script language="javascript" type="text/javascript" src="https://raptr.finance/new-website/web3.min.js"></script>
    <script language="javascript" type="text/javascript" src="https://raptr.finance/new-website/jquery.min.js"></script>
    <script language="javascript" type="text/javascript" src="raptr-staking-script.js"></script>
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
        <nav id="left-navbar">
            <ul>
                <li>
                    <a href="index.html" class="nav-item-home">Home</a>
                </li>
                <li>
                    <a href="about.html" class="nav-item-roadmap">About</a>
                </li>
                <li>
                    <a href="https://raptr.finance/staking" class="nav-item-staking active">Staking</a>
                </li>
                <!--<li>
                    <a href="lottery.html" class="nav-item-lottery">Lottery</a>
                </li>-->
                <li>
                    <a href="faq.html" class="nav-item-faq">FAQ</a>
                </li>
<!--                <li>
                    <a href="news.html" class="nav-item-news">News</a>
                </li>-->
            </ul>
            <div class="navigation-footer">
                <div class="text-center text-lg-left mb-2">
                    <a href="https://twitter.com/raptor_token" class="btn-social">
                        <span class="iconify" data-icon="jam:twitter-circle" data-inline="false"></span>
                    </a>
                    <a href="https://t.me/PhilosoRaptorToken" class="btn-social">
                        <span class="iconify" data-icon="ri:telegram-line" data-inline="false"></span>
                    </a>
                </div>
                <div>
                    <a href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xf9A3FdA781c94942760860fc731c24301c83830A" class="btn btn-success btn-block">
                        Buy on PancakeSwap
                    </a>
                </div>
                <div class="mt-3">
                    <a href="https://bscscan.com/token/0xf9a3fda781c94942760860fc731c24301c83830a#balances" class="btn btn-light btn-block">
                        View on BSCscan
                    </a>
                </div>
            </div>
        </nav>

    </div>

    <div class="content-wrapper">


        <div class="container-fluid">
            <div class="Staking-container">

                <div class="row">
                    <div class="col-12 col-lg-10">

                        <img src="https://raptr.finance/new-website/images/staking.svg" class="mb-3" width="250">
                        <div>
                            <p class="text-white">
                                This is a simple, non-custodial staking tool for adopters of RAPTOR to <br>
                                easily stake their RAPTOR into the contract to earn 5% APR!
                            </p>
                            <p class="text-white">
                                You need to be connected to the Binance Smart Chain to use anything <br>
                                other than the Calculator!
                            </p>
                            <p class="text-white">
                                If you are not connected to this network, the page will appear as if it is
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
                                                <div class="text-dark-light small" id="staking-address"></div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Balance</strong>
                                                <div class="text-dark-light" id="staking-balance">0</div>
                                            </div>
                                            <div class="mt-3">
                                                <strong class="text-dark">Calculated Staking Rewards</strong>
                                            </div>

                                            <div class="mt-3">
                                                <div>
                                                    <input type="text" class="form-control" placeholder="Amount" id="staking-amount">
                                                </div>
                                            </div>
                                            <div class="mt-3">
                                                <div class="d-flex justify-content-between">
                                                    <strong class="text-dark">Weekly rewards </strong>
                                                    <div class="text-dark-light small" id="staking-rewards-estimated">0</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6 col-lg-6">
                                    <div class="card card-rounded-x2  overflow-hidden mt-3 gradient-green-blue">
                                        <div class="card-body p-5 text-left">
                                            <div>
                                                <h4 class="text-dark font-weight-bold">Staking</h4>
                                            </div>

                                            <div class="d-flex justify-content-between align-items-end">
                                                <div>
                                                    <div>
                                                        <img src="https://raptr.finance/new-website/images/token-logo.svg" height="70">
                                                    </div>
                                                    <div class="mt-2">
                                                        <h4 class="text-dark font-weight-bold mb-0" id="rewards"></h4>
                                                        <span class="text-dark-light">Raptor Earned</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <a href="javascript:void(0)" class="btn btn-light btn-block" id="btn-harvest">
                                                        Harvest
                                                    </a>
                                                </div>
                                            </div>
                                            <div class="mt-2">
                                                <div class="container-fluid px-0">
                                                    <div class="row">
                                                        <div class="col-7">
                                                            <a href="javascript:void(0)" id="btn-stake" class="btn btn-dark btn-block">Stake</a>
                                                        </div>
                                                        <div class="col-5">
                                                            <a href="javascript:void(0)" id="btn-unstake" class="btn btn-block btn-light">Unstake</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mt-3">
                                                <div class="mt-1">
                                                    <strong class="text-dark">Current APR</strong>
                                                    <span class="text-dark-light">5%</span>
                                                </div>
                                                <div class="mt-1">
                                                    <strong class="text-dark">Your Stake </strong>
                                                    <span class="text-dark-light" id="stakedAmounts">0</span>
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

    </div>
    <div class="main-nav-overlay" aria-expanded="false"></div>

    <div class="modal modal-custom fade modal-dark" id="StakingModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Stake</h5>
                    <button type="button" class="btn-close">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-end">
                        <div class=" text-success pb-2">
                            <span id="staking-available">0</span> RAPTOR Available
                        </div>
                    </div>
                    <div class="my-3">

                        <div class="input-group mb-3">
                            <input type="text" class="form-control form-control-dark" placeholder="0"
                                   aria-label="Recipient's username" aria-describedby="button-stake-max" id="stake-amount-todo">
                            <div class="input-group-append">
                                <span class="input-group-text bg-transparent border-0">
                                <span class="text-light">Raptor</span></span>
                                <button class="btn btn-success" type="button" id="button-stake-max">Max</button>
                            </div>
                        </div>


                    </div>
                </div>
                <div class="modal-footer">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-6">
                                <button type="button" class="btn btn-block btn-close-modal btn-outline-success" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="btn btn-block btn-success" id="button-stake-confirm">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal modal-custom fade modal-dark" id="UnStakingModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Unstake Raptor Token</h5>
                    <button type="button" class="btn-close">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-end">
                        <div class=" text-success pb-2">
                            <span id="unstaking-available">0</span> Staked RAPTOR Available
                        </div>
                    </div>
                    <div class="my-3">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control form-control-dark" placeholder="0"
                                   aria-label="Recipient's username" aria-describedby="button-addon2" id="unstake-amount-todo">
                            <div class="input-group-append">
                                <span class="input-group-text bg-transparent border-0">
                                <span class="text-light">Raptor</span></span>
                                <button class="btn btn-success" type="button" aria-describedby id="button-addon2">Max</button>
                            </div>
                        </div>


                    </div>
                </div>
                <div class="modal-footer">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-6">
                                <button type="button" class="btn btn-block btn-close-modal btn-outline-success" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                            </div>
                            <div class="col-6">
                                <button id="button-unstake-confirm" type="button" class="btn btn-block btn-success">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</main>

<script src="https://code.iconify.design/1/1.0.7/iconify.min.js"></script>
<script src="https://raptr.finance/new-website/jquery.min.js"></script>
<script src="https://raptr.finance/new-website/bootstrap.min.js"></script>
<script src="https://raptr.finance/new-website/src/app.js"></script>
</body>
</html>
