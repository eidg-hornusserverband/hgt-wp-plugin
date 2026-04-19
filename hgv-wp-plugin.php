<?php
/*
Plugin Name: HGT WP Plugin
Plugin URI: https://github.com/eidg-hornusserverband/hgt-wp-plugin
Description: Plugin für die Integration der HGV-Daten.
Version: 2.0.1
Author: EHV - EDVK
Author URI: https://ehv.ch
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$hgv_pluginName = "HGVerwaltung";
$hgv_optionsCode = "wpv_code";


register_activation_hook(__FILE__, 'hgV_install');
register_deactivation_hook(__FILE__, 'hgv_deactivate');
register_uninstall_hook(__FILE__, 'hgv_uninstall');

add_action('plugin_action_links_' . plugin_basename(__FILE__), array("HGVerwaltungAdmin", 'addAdminLinksToPlugin'));
add_action('admin_menu', array("HGVerwaltungAdmin", 'addAdminPages'));
add_action('admin_post_hgV_wpvCode', array("HGVerwaltungAdmin", 'hgV_wpvCode_response'));
add_action('init', 'register_hgv_pattern_categories');
add_action('init', 'register_hgv_patterns');


add_shortcode("hgv", array("HGVerwaltungFrontend", 'hgv_shortcode'));

require_once(WP_PLUGIN_DIR . "/hgt-wp-plugin/admin/hgVerwaltungAdmin.php");
require_once(WP_PLUGIN_DIR . "/hgt-wp-plugin/frontend/hgVerwaltungFrontend.php");


function register_hgv_patterns()
{
   foreach (HGVerwaltungFrontend::getHelpPatterns() as $key => $pattern) {
      $key = 'hgv/help-patterns-' . $key;
      register_block_pattern(
         $key,
         $pattern
      );
   }
}

function register_hgv_pattern_categories()
{
   register_block_pattern_category(
      'hgverwaltung',
      array('label' => 'HG Verwaltung')
   );
}

function hgV_install()
{
   add_option("wpv_code", 'test');
   add_option("wpv_inDevMode", "false");
   add_option("wpv_date_format", get_option("date_format"));

   if (!wp_next_scheduled('hgv_schedule_cron_event')) {
      wp_schedule_event(time(), 'daily', 'hgv_schedule_cron_event');
   }
}


function hgv_uninstall()
{
   delete_option("wpv_code");
   delete_option("wpv_date_format");
   delete_option("wpv_inDevMode");
}

function hgv_deactivate()
{
   wp_clear_scheduled_hook('hgv_schedule_cron');
}


require 'plugin-update-checker/plugin-update-checker.php';

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
   'https://github.com/eidg-hornusserverband/hgt-wp-plugin/',
   __FILE__,
   'hgt-wp-plugin'
);

//Set the branch that contains the stable release.

if($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == "*.local") {
   $myUpdateChecker->setBranch('development');
} else {
   $myUpdateChecker->setBranch('main');
}

