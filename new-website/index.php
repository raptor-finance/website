<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name=viewport content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Home</title>
    <link rel="icon" type="image/png" href="/images/lsolo-logo.svg">
    <link rel="stylesheet" href="src/app.css">
    <link rel="stylesheet" href="src/media.css">
</head>
<body>


<main class="main-wrapper">
    <div class="navigation-wrapper">
        <div class="logo-wrapper">
            <img src="./images/logo.svg" class="img-logo">
            <button class="navbar-toggler" type="button" data-target="#left-navbar" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="iconify" data-icon="bi:list" data-inline="false"></span>
            </button>
        </div>

    <?php include_once("nav.php"); ?>


    </div>

    <div class="content-wrapper">


        <div class="container-fluid">

            <div class="home-container">
                <div class="row align-items-center">
                    <div class="col-12 col-lg-7 mb-4 mb-lg-0">
                        <h1 class="text-white font-weight-bold">
                            <div>Can we heal</div>
                            the world?
                        </h1>
                        <div>
                            <p class="text-white">
                                Raptor finance is a decentralized, financial ecosystem designed by holders for holders.
                                Our mission is to heal planet earth and stop climate change by allowing our holders to
                                stake
                                their
                                tokens to generate yield for themselves and ecological projects.
                            </p>
                        </div>
                        <div>

                            <div class="row">
                                <div class="col-6">
                                    <a href="" class="btn btn-outline-light btn-block">About Raptor</a>
                                </div>
                                <div class="col-6">
                                    <a href="" class="btn btn-light btn-block">WhitePaper</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-5">

                        <div class="row">
                            <div class="col-12 col-md-6 col-lg-6 mb-3 mb-lg-auto">
                                <a href="./staking.html">
                                    <div class="card card-dark card-rounded-x2">
                                        <div class="card-body text-center">
                                            <img src="./images/staking.svg" width="120" height="60">
                                            <div class="mt-2 small">
                                                Earn More Raptors
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <div class="col-12 col-md-6 col-lg-6">
                                <a href="./lottery.html">
                                    <div class="card card-dark card-rounded-x2">
                                        <div class="card-body text-center">
                                            <img src="./images/lottery.svg" width="120" height="60">
                                            <div class="mt-2 small">
                                                Win More Raptors
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="row">
                          <div class="col-12 col-lg-1"></div>
                            <div class="col-12 col-lg-10">
                                <div class="card card-rounded-x2  overflow-hidden mt-1 gradient-green-blue mb-5">
                                    <div class=" planet-earth-image"/>
                                        <div class="card-body text-left">
                                          <div class="row p-4">
                                            <div class="col-12">
                                              <h2 class="text-dark font-weight-bold mb-5 mt-5">Raptor Forest</h2>
                                            </div>

                                            <div class="col-12 col-lg-6">
                                            <div class="text-dark pb-2">
                                                <h5><strong>Funded by:</strong><span class="font-weight-thin"> Raptor Finance <span></h4>
                                            </div>
                                            <div class="text-dark pb-2">
                                                <h5><strong>CO2 Offset:</strong> 3 tonnes</h4>
                                            </div>
                                            <div class="text-dark">
                                                <h5><strong>Projects:</strong> 2</h4>
                                            </div>
                                           </div>

                                           <div class="col-12 col-lg-6">
                                           <div class="text-dark pb-2">
                                               <h5><strong>Age:</strong> <span id="dayCounter">Loading...</span></h4>
                                           </div>
                                           <div class="text-dark pb-2">
                                               <h5><strong>Species:</strong> 6</h4>
                                           </div>
                                           <div class="text-dark">
                                               <h5><strong>Trees:</strong> 151</h4>
                                           </div>
                                          </div>

                                          <div class="col-12">
                                            <!--<h6 class="text-underline text-dark font-weight-thin mb-5 mt-5"><a class="text-dark" href="">Coming Soon</a></h6>-->
                                          </div>

                                          </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-lg-1"></div>
                            </div>
                    </div>
                </div>
            </div>

        </div>

    </div>
  <div class="main-nav-overlay" aria-expanded="false"></div>
</main>

<script type="application/javascript" src="https://code.iconify.design/1/1.0.7/iconify.min.js"></script>
<script type="application/javascript" src="jquery.min.js"></script>
<script type="application/javascript" src="bootstrap.min.js"></script>
<script type="application/javascript" src="src/app.js"></script>
<script type="application/javascript" src="daycounter.js"></script>
</body>
</html>
