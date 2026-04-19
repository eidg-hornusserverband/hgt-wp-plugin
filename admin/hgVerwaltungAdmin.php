<?php
class HGVerwaltungAdmin
{

    static function addAdminLinksToPlugin($links)
    {
        $links = array_merge(array(
            '<a href="' . esc_url(admin_url('/options-general.php?page=hgv_options')) . '">' . __('Settings', 'textdomain') . '</a>'
        ), $links);
        return $links;
    }
    static function addAdminPages()
    {
        add_options_page('HgVerwaltung Options', 'HG Verwaltung', 'manage_options', 'hgv_options', array("HGVerwaltungAdmin", 'plugin_options'));
    }
    static function plugin_options()
    {
        $plugin_name = "wp-hgverwaltung";
        $plugin_options_nonce = wp_create_nonce('hgv_plugin_options_nonce_form');

        $plugin_options_nonce = wp_create_nonce('hgv_plugin_options_nonce_form');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        if (isset($_GET["success"])) {
            $connectionIsPossible = @file_get_contents("https://www.hgverwaltung.ch/api/1/" . get_option("wpv_code", "test") . "/mannschaften?hgv_wp_pluginversion=" . HGV_PLUGIN_VERSION);
            if (strlen($connectionIsPossible) > 2) {
                echo '
                <div class="updated">
                    <p>' . _('Die Einstellungen wurden erfolgreich übernommen. ') . '</p>
                </div>
                ';
            } else {
                echo '
                <div class="error">
                    <p>' . _('Die Einstellungen wurden übernommen, jedoch konnten keine Daten empfangen werden. Überprüfe bitte den Club Code.') . '</p>
                </div>
                ';
            }
            if ($connectionIsPossible === FALSE) {
                echo '
                <div class="error">
                    <p>' . _('Es konnte keine Verbindung zur HG Verwaltung aufgebaut werden..') . '</p>
                </div>
                ';
            }
        }

        include_once(WP_PLUGIN_DIR . "/hgt-wp-plugin/admin/hgVerwaltungAdminPage.php");
    }
    static function hgV_wpvCode_response($response)
    {
        if (isset($_POST['hgv_plugin_options_nonce']) && wp_verify_nonce($_POST['hgv_plugin_options_nonce'], 'hgv_plugin_options_nonce_form')) {
            $hgv_Webcode = sanitize_key($_POST['hgv']['club_webcode']);
            update_option("wpv_code", $hgv_Webcode);
            $hgv_date_format = sanitize_option("date_format", $_POST['hgv']['date_format']);
            if (!$hgv_date_format == "custom") {
                $hgv_date_format = sanitize_option("date_format", $_POST['hgv']['date_format_custom']);
            if (!$hgv_date_format == "custom") {
                $hgv_date_format = sanitize_option("date_format", $_POST['hgv']['date_format_custom']);
            }
            update_option("wpv_date_format", $hgv_date_format);
            wp_redirect(admin_url('/options-general.php?page=hgv_options&success'));
        }
    }
}
