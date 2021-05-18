<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

require_once(get_template_directory() . '/inc/bootstrap.php');

if (!function_exists('excerpt')) {
    function excerpt($limit)
    {
        $excerpt = explode(' ', get_the_content(), $limit);
        if (count($excerpt) >= $limit) {
            array_pop($excerpt);
            $excerpt = implode(" ", $excerpt) . '...';
        } else {
            $excerpt = implode(" ", $excerpt);
        }
        $excerpt = preg_replace('`[[^]]*]`', '', $excerpt);

        return $excerpt;
    }
}

if (function_exists('add_theme_support')) {
    add_theme_support('post-thumbnails');
}


if (!function_exists('reading_time')) {
//estimated reading time
    function reading_time()
    {
        global $post;
        $content = get_post_field('post_content', $post->ID);
        $word_count = str_word_count(strip_tags($content));
        $readingtime = ceil($word_count / 200);
        if ($readingtime == 1) {
            $timer = " Min Read";
        } else {
            $timer = " Min Read";
        }
        $totalreadingtime = $readingtime . $timer;
        return $totalreadingtime;
    }
}