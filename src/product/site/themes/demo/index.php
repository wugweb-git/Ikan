<?php
/**
 * Template front page for iKAN Health
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

    <?php the_content(); ?>

  <?php endwhile; endif; ?>

</main>

<?php get_footer(); ?>