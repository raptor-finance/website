<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

if (!function_exists("get_template_directory_assets_uri")) {
    function get_template_directory_assets_uri()
    {
        return get_template_directory_uri() . '/';
    }
}

if (!function_exists("get_template_directory_images_uri")) {
    function get_template_directory_images_uri($url = '')
    {
        return get_template_directory_uri() . '/images'. $url;
    }
}

if (!function_exists("load_stylesheets")) {
    function load_stylesheets()
    {
        wp_register_style('style', get_template_directory_assets_uri() . '/style.css', array(), 1, 'all');
        wp_enqueue_style('style');
    }
}


if (!function_exists("load_scripts")) {
    function load_scripts()
    {
        wp_register_script('jquery-custom',  get_template_directory_assets_uri() . '/node_modules/jquery/dist/jquery.min.js', 'jquery', 1, true);
        wp_enqueue_script('jquery-custom');
        wp_register_script('boostrap', get_template_directory_assets_uri() . '/node_modules/bootstrap/dist/js/bootstrap.min.js', '', 1, true);
        wp_enqueue_script('boostrap');
        wp_register_script('iconify', 'https://code.iconify.design/1/1.0.7/iconify.min.js', '', 1, true);
        wp_enqueue_script('iconify');
        wp_register_script('custom-script', get_template_directory_assets_uri() . '/src/app.js', '', 1, true);
        wp_enqueue_script('custom-script');
    }
}
add_action('wp_enqueue_scripts', 'load_scripts');
add_action('wp_enqueue_scripts', 'load_stylesheets');
