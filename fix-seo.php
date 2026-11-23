<?php
/** Rank Math SEO Bulk Fix - Part 3: Image Alt Tags */
global $total;
$total += 0;

function add_alt_tags() {
    global $total;
    $types = ['post' => 'Posts', 'page' => 'Pages'];
    foreach ($types as $t => $l) {
        $posts = get_posts(["post_type" => $t, 'post_status' => 'publish', 'posts_per_page' => -1]);
        $fixed = 0;
        foreach ($posts as $p) {
            if (empty($p->post_content)) continue;
            preg_match_all('/<img\s[^>]*>/i', $p->post_content, $imgs);
            foreach ($imgs[0] as $img) {
                if (strpos($img, 'alt=') !== false) continue;
                $url = '';
                if (preg_match('/src=[^>"]*"([^"]+)"[^>]*>/i', $img, $m)) $url = $m[1];
                if (preg_match('/src=[^>]*>([^<]+)</i', $img, $m)) $url = $m[1];
                $alt = '';
                if (!empty($url)) {
                    $att_id = attachment_url_to_post_id($url);
                    if (!empty($att_id)) $alt = get_post_meta($att_id, '_wp_attachment_image_alt', true);
                }
                if (empty($alt)) $alt = 'Image description';
                $new_img = preg_replace('/(<img\s[^>]*)>/i', '$1 alt="' . $alt . '" >', $img);
                if ($new_img !== $img) {
                    $p->post_content = str_replace($img, $new_img, $p->post_content);
                    $fixed++;
                    $total++;
                }
            }
            if ($fixed > 0) {
                wp_update_post(["ID" => $p->ID, "post_content" => $p->post_content]);
            }
        }
        echo "$l alt tags: $fixed images fixed\n";
    }
}
add_alt_tags();
echo "Total alt tags fixed: $total\n";
?>
<?php
/** Rank Math SEO Bulk Fix - Part 2: Meta Descriptions */
global $total;
$total += 0;

function add_meta_descriptions() {
    global $total;
    $types = ['post' => 'Posts', 'page' => 'Pages'];
    foreach ($types as $t => $l) {
        $posts = get_posts(["post_type" => $t, 'post_status' => 'publish', 'posts_per_page' => -1]);
        foreach ($posts as $p) {
            if (!get_post_meta($p->ID, '_rank_math_description', true)) {
                $desc = '';
                if (!empty($p->post_excerpt) && strlen(trim($p->post_excerpt)) > 50) {
                    $desc = trim(strip_tags($p->post_excerpt));
                } else {
                    $content = strip_tags($p->post_content);
                    $content = preg_replace('/\s+/', ' ', $content);
                    $desc = strlen($content) > 155 ? substr($content, 0, 155) . '...' : $content;
                }
                if (strlen($desc) > 50) {
                    update_post_meta($p->ID, '_rank_math_description', $desc);
                    $total++;
                }
            }
        }
        echo "$l descriptions done\n";
    }
}
add_meta_descriptions();
echo "Meta descriptions: $total generated\n";
?>
<?php
/** Rank Math SEO Bulk Fix - Part 1: Focus Keywords */
define('ABSPATH', dirname(__FILE__) . '/');
require_once ABSPATH . 'wp-load.php';

error_reporting(E_ERROR | E_WARNING | E_PARSE);
$total = 0;

function add_focus_keywords() {
    global $total;
    $types = ['post' => 'Posts', 'page' => 'Pages'];
    foreach ($types as $t => $l) {
        $posts = get_posts(["post_type" => $t, 'post_status' => 'publish', 'posts_per_page' => -1]);
        foreach ($posts as $p) {
            if (!get_post_meta($p->ID, '_rank_math_focus_keyword', true)) {
                $title = $p->post_title;
                if (!empty($title)) {
                    $words = explode(' ', $title);
                    $sw = ['a','an','the','and','or','but','for','nor','on','at','to','from','by','in','of','is','it'];
                    $kw = [];
                    foreach ($words as $w) { if (!in_array(strtolower($w),$sw) && strlen($w)>2) { $kw[]=$w; if(count($kw)>=4) break; } }
                    if(!empty($kw)) update_post_meta($p->ID, '_rank_math_focus_keyword', implode(' ',$kw));
                }
                $total++;
            }
        }
        echo "$l done\n";
    }
}
add_focus_keywords();
echo "Focus keywords: $total set\n";
?>