<?php
$output = '
<div class="wrap">
            <h1>Hornusser Verwaltung</h1>
            <p>Hier muss der Code eingegeben werden.</p>
            <form action="' . sanitize_url(admin_url('admin-post.php')) . '" id="hgV-wpvCode" method="post">
                <input type="hidden" name="action" value="hgV_wpvCode">
                <input type="hidden" name="hgv_plugin_options_nonce" value="' . $plugin_options_nonce . '" />
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="' . $plugin_name . '-club_webcode">' . _('Bitte Club Code eingeben:') . '</label><br>
                        </th>
                        <td>
                            <input required id="' . $plugin_name . '-club_webcode" type="text" name="hgv[club_webcode]" value="' . get_option("wpv_code") . '" placeholder="' . _('Club Web Code') . '" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">' . _('Date Format') . '</th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text"><span>' . _('Date Format') . '</span></legend>
                                ';
$date_formats = array_unique(apply_filters('date_formats', array('F j, Y', 'd.m.Y', 'd/m/Y', 'd. M Y')));

$custom = true;

foreach ($date_formats as $format) {
    $output .= "\t<label><input type='radio' name='hgv[date_format]' value='" . esc_attr($format) . "'";
    if (get_option('wpv_date_format') === $format) { // checked() uses "==" rather than "==="
        $output .= " checked='checked'";
        $custom = false;
    }
    $output .= ' /> <span class="date-time-text format-i18n">' . date_i18n($format) . '</span><code>' . esc_html($format) . "</code></label><br />\n";
}

$output .= '<label><input type="radio" name="hgv[date_format]" id="date_format_custom_radio" value="custom"';
if ($custom) { $output .= " checked='checked'"; }
$output .= '/> <span class="date-time-text date-time-custom-text">' . _('Custom:') . '<span class="screen-reader-text"> ' . _('enter a custom date format in the following field') . '</span></span></label>' .
    '<label for="date_format_custom" class="screen-reader-text">' . _('Custom date format:') . '</label>' .
    '<input type="text" name="hgv[date_format_custom]" id="date_format_custom" value="' . esc_attr(get_option('wpv_date_format')) . '" />' .
    '<br />' .
    '<p><strong>' . _('Preview:') . '</strong> <span class="example">' . date_i18n(get_option('wpv_date_format')) . '</span>' .
    "<span class='spinner'></span>\n" . '</p>';
$output .= '
                            </fieldset>
                        </td>
                    </tr>
                </table>
                <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="' . _("Speichern") . '"></p>
            </form>
        </div>';
echo $output;
