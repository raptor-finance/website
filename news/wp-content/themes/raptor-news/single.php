    <?php
    get_header();

    $category_detail = get_the_category($post->ID);//$post->ID
    $catPrint='';
    foreach ($category_detail as $cat) {
        $category_link = get_category_link($cat->cat_ID);
        $category_name = $cat->name;
    }
    $catPrint = '';
    if(!empty($category_name))
    {
        $catPrint='<span><a class="badge badge-dark mb-2 text-white" href="'.$category_link.'"><i class="fa fa-folder-o"
        aria-hidden="true"></i> '.$category_name.'</a></span>';
    }

    ?>


    <main class="main-wrapper">
    <?php
    get_sidebar();
    ?>

        <div class="content-wrapper">

            <div class="container-fluid">

                <div class="news-container">
                    <div class="row">
                        <div class="col-12">
                            <h1 class="text-white font-weight-bold">
                                <?php
                                the_title()
                                ?>
                            </h1>
    <div>
    <?= $catPrint ?>
    </div>
                        </div>
                        <div class="col-12 col-lg-9">
                            <div>

    <div class="card my-3 card-dark  card-rounded-x2">
                                <div class="card-body  single-card px-5 py-4 text-white">

    <div class="single-page-thumbnail">
    <?php the_post_thumbnail('post-thumbnail',['class'=>'thumbnail-single-post']); ?>
    </div>
                                    <?php the_content() ?>
                                </div>
                            </div>
                            </div>



                <div class="mt-5">

    <?php
    echo "<div class='page-nav-container'>" . paginate_links(array(
            'total' => $postIndex->max_num_pages,
            'prev_text' => __('<'),
            'next_text' => __('>')
        )) . "</div>";
    ?>

    </div>
                        </div>

                        <div class="col-12 col-lg-3 position-relative">

                                <div class="card card-rounded-x2  d-none d-lg-block card-bottom-sticky overflow-hidden gradient-green-blue">
                                    <div class="gradient-green-blue-image card-logo">
                                        <div class="card-body py-5  text-left">
                                            <div>
                                                <h2 class="text-dark font-weight-bold">
                                                    <div>Read Most</div>
                                                    <div>Recent Raptors</div>
                                                    <div> News Here</div>
                                                </h2>
                                            </div>
                                            <div class="py-3">
                                                <p class="small pt-3 text-white">
                                                    Your FAQ page should address
                                                    the most common questions
                                                    customers have about your
                                                    products, services, and brand as a
                                                    whole.
                                                </p>

                                                <div class="small text-white">
                                                    Any Question? <a class="text-underline" href="">See our FAQ</a>
                                                </div>

                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
                                                <br>
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



    <?php
    get_footer();
    ?>