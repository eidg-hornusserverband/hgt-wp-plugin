<?php
class HGVerwaltungFrontend
{
    private static function replace_hgvCode($page, $shortcode)
    {
        $hgv_club = get_option("wpv_code", "test");

        if (isset($shortcode["teamselect"])) {
            $teamselect = $shortcode["teamselect"];
        } else {
            $teamselect = "Alle";
        }
        if (isset($shortcode["hideteamselect"])) {
            $hideteamselect = $shortcode["hideteamselect"] == "1";
        } else {
            $hideteamselect = false;
        }
        if (isset($shortcode["jahrselect"])) {
            $jahrselect = $shortcode["jahrselect"];
        } else {
            $jahrselect = date("Y");
        }
        if (isset($shortcode["hidejahrselect"])) {
            $hidejahrselect = $shortcode["hidejahrselect"] == "1";
        } else {
            $hidejahrselect = false;
        }
        if (isset($shortcode["alle"])) {
            $alle = $shortcode["alle"];
        } else {
            $alle = false;
        }
        if (isset($shortcode["hidealle"])) {
            $hidealle = ($shortcode["hidealle"] == "1");
        } else {
            $hidealle = true;
        }


        $plugin_content = file_get_contents(WP_PLUGIN_DIR . "/hgt-wp-plugin/frontend/v1/$page.html");

        $plugin_content = str_replace("<<hgv_code>>", $hgv_club, $plugin_content);
        $plugin_content = str_replace("<<hgv_mannschaft>>", $teamselect, $plugin_content);
        $plugin_content = str_replace("<<jahr>>", $jahrselect, $plugin_content);

        $plugin_content = str_replace("<<displayNone-hg_teamSelect>>", ($hideteamselect) ? 'style="display:none;"' : '', $plugin_content);
        $plugin_content = str_replace("<<displayNone-hg_jahrSelect>>", ($hidejahrselect) ? 'style="display:none;"' : '', $plugin_content);
        $plugin_content = str_replace("<<displayNone-hg_alle>>", ($hidealle) ? 'style="display:none;"' : '', $plugin_content);

        wp_enqueue_script('hgv-script', WP_PLUGIN_URL . "/hgt-wp-plugin/frontend/v1/$page.js", array(), '1.0', true);
        wp_enqueue_script('hgv-helper-script', WP_PLUGIN_URL . "/hgt-wp-plugin/frontend/v1/selectHelperFunctions.js", array(), '1.0', true);
        wp_localize_script('hgv-script', 'hgvScriptData', [
            'hgv_code' => $hgv_club,
            'jahr' => $jahrselect,
            'mannschaft' => $teamselect,
            'nurMeisterschaft' => $alle,
        ]);

        return $plugin_content;
    }


    public static function hgv_shortcode($shortcode)
    {
        if (isset($shortcode["type"])) {
            switch (strtolower($shortcode["type"])) {
                case 'anlaesse':
                    return self::replace_hgvCode("anlaesse", $shortcode);
                    break;

                case 'schnitt':
                    return self::replace_hgvCode("schnitt", $shortcode);
                    break;

                case 'spiele':
                    return self::replace_hgvCode("spiele", $shortcode);
                    break;

                case 'spieler':
                    return self::replace_hgvCode("spieler", $shortcode);
                    break;

                case 'spielerpunktegrafisch':
                    return self::replace_hgvCode("spielerpunktegrafisch", $shortcode);
                    break;

                case 'spielemitresultat':
                    return self::replace_hgvCode("spieleMitResultat", $shortcode);
                    break;

                case 'spielemitresultattingle':
                    return self::replace_hgvCode("spieleMitResultatTingle", $shortcode);
                    break;

                case 'mannschaftsdurchschnitt':
                    return self::replace_hgvCode("mannschaftsdurchschnitt", $shortcode);
                    break;

                default:
                    return;
            }
        }
    }
    public static function getHelpPatterns($selecter = "alle")
    {
        if (strlen(@file_get_contents("https://www.hgverwaltung.ch/api/1/" . get_option("wpv_code", "test") . "/mannschaften")) > 2) {
            $teamsarray = json_decode(file_get_contents("https://www.hgverwaltung.ch/api/1/" . get_option("wpv_code", "test") . "/mannschaften"));
            $jahrarray = json_decode(file_get_contents("https://www.hgverwaltung.ch/api/1/" . get_option("wpv_code", "test") . "/spiele/jahre"));
        } else {
            $teamsarray = array("no Connection");
            $jahrarray = array("no Connection");
        }
        $teams = implode(",", $teamsarray);
        $functions = array(
            "hgv_listeAllerTeams" => array(
                'title'       => 'Team Liste',
                'categories'   => ['hgverwaltung',],
                'description' => 'Mannschaftsdurchschnitt mit diversen Zahlen',
                'content'     => '<!-- wp:paragraph  -->Dies sind alle Teams, die du bei der HG Verwaltung hinterlegt hast:<br />' . implode("<br />", $teamsarray),
            ),
            "hgv_listeAllerJahre" => array(
                'title'       => 'verfügbare Jahre',
                'categories'   => ['hgverwaltung',],
                'description' => 'Listet dir alle Jahre mit verfügbaren Daten auf',
                'content'     => '<!-- wp:paragraph  -->Dies sind alle Jahre, bei denen du Daten in der HG Verwaltung hinterlegt hast:<br />' . implode("<br />", $jahrarray),
            ),
            "hgv_schnitt" => array(
                'title'       => 'Schnitte',
                'categories'   => ['hgverwaltung',],
                'description' => 'Mannschaftsdurchschnitt mit diversen Zahlen',
                'content'     => '<!-- wp:paragraph  -->[hgv type="schnitt" mannschaft="' . $teams . '" nurMeisterschaft="ja, oder ganz weglassen" jahr="optional" ]',
            ),
            "hgv_anlaesse" => array(
                'title'       => 'Anlässe',
                'categories'   => ['hgverwaltung',],
                'description' => 'Listet alle Anlässe eines Jahres auf. Wahlweise inkl Spiele.',
                'content'     => '<!-- wp:paragraph  -->[hgv type="anlaesse" mannschaft="' . $teams . '" inklspiele="ja, oder ganz weglassen" jahr="optional" ]',
            ),
            "hgv_mannschaftsdurchschnitt" => array(
                'title'       => 'Mannschaftsdurchschnitt',
                'categories'   => ['hgverwaltung',],
                'description' => 'Listet den Durchschnitt einer Mannschaft aus. Wahlweise nur Meisterschaft.',
                'content'     => '<!-- wp:paragraph  -->[hgv type="mannschaftsdurchschnitt" mannschaft="' . $teamsarray[0] . '" nurMeisterschaft="ja, oder ganz weglassen" jahr="optional" ]',
            ),
            "hgv_spiele" => array(
                'title'       => 'Spiele',
                'categories'   => ['hgverwaltung',],
                'description' => 'Terminübersicht der Spiele einer Saison.',
                'content'     => '<!-- wp:paragraph  -->[hgv type="spiele" mannschaft="' . $teams . '" jahr="optional" ]',
            ),
            "hgv_spielmitResultat" => array(
                'title'       => 'Spiele mit Resultat',
                'categories'   => ['hgverwaltung',],
                'description' => 'Terminübersicht der Spiele einer Saison mit Resultaten.',
                'content'     => '<!-- wp:paragraph  -->[hgv type="spieleMitResultat" mannschaft="' . $teams . '" jahr="optional" ]',
            ),
            "hgv_spielmitResultat" => array(
                'title'       => 'Spiele mit Resultat in Tingle',
                'categories'   => ['hgverwaltung',],
                'description' => 'Terminübersicht der Spiele einer Saison mit Resultaten als Tingle.',
                'content'     => '<!-- wp:paragraph  -->[hgv type="spieleMitResultatTingle" mannschaft="' . $teams . '" jahr="optional" ]',
            ),
            "hgv_spieler" => array(
                'title'       => 'Spieler',
                'categories'   => ['hgverwaltung',],
                'description' => 'Anzeige der Spieler je Mannschaft mit Foto, Name, Jahrgang, Position und Funktion',
                'content'     => '<!-- wp:paragraph  -->[hgv type="spieler" mannschaft="' . $teams . '" ]',
            ),
            "hgv_spielerPunkte" => array(
                'title'       => 'Spieler Schlagleistung grafisch',
                'categories'   => ['hgverwaltung',],
                'description' => 'Grafische Darstellung der geschlagenen Punkte eines Spielers',
                'content'     => '<!-- wp:paragraph  -->[hgv type="spielerpunktegrafisch" ]',
            )
        );

        if ($selecter == "alle") {
            return $functions;
        } else {
            return $functions[$selecter];
        }
    }
}
