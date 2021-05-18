<?php
get_header();
$categories = get_the_category();
$categories_id=$categories[0]->cat_ID;
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
                            echo esc_html( $categories[0]->name );
                            ?>
                        </h1>

                        <div>
                            <p class="text-white mb-5">
                                This is a simple, non-custodial Proof of Work Random Number Generation
                            </p>
                        </div>
                    </div>
                    <div class="col-12 col-lg-9">
                        <div>
                        <?php
            $ourCurrentPage = get_query_var('paged');
            $postIndex = new WP_Query(array('paged' => $ourCurrentPage,'cat'=>$categories_id));
            if ($postIndex->have_posts()) {
                while ($postIndex->have_posts()) : $postIndex->the_post();
                    $category_detail = get_the_category($post->ID);//$post->ID
                    $catPrint = '';
                    foreach ($category_detail as $cat) {
                        $category_link = get_category_link($cat->cat_ID);
                        $category_name = $cat->name;
                    }


                    ?>



<a href="<?= the_permalink() ?>">

<div class="card mb-3 card-dark card-rounded-x2">
                            <div class="card-body px-5 py-4 text-white">
                            <div class="row">
                                <div class="col-12 col-xl-4 col-lg-3 col-md-5">
                                    <div class="post-thumbnail" style="background-image: url(<?= the_post_thumbnail_url('post-thumbnail',['class'=>'thumbnail-single-post']); ?>);">
                                        </div>
                                </div>
                                <div class="col-12 col-xl-8 col-lg-9 col-md-7">

                                    <h4 class="font-weight-bold text-success">
                                        <?php the_title(); ?></h4>

                                    <?= excerpt(40) ?>
                                </div>
                            </div>
                            </div>
                        </div>
</a>


                    <?php
                endwhile;
            }

                    ?>
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
                                    <div class="card-body py-5 text-left">
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