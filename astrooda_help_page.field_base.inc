<?php
/**
 * @file
 * astrooda_help_page.features.field_base.inc
 */

/**
 * Implements hook_field_default_field_bases().
 */
function astrooda_help_page_field_default_field_bases() {
  $field_bases = array();
  
  // Exported field_base: 'field_images_to_insert'.
  $field_bases['field_images_to_insert'] = array(
    'active' => 1,
    'cardinality' => -1,
    'deleted' => 0,
    'entity_types' => array(),
    'field_name' => 'field_images_to_insert',
    'indexes' => array(
      'fid' => array(
        0 => 'fid',
      ),
    ),
    'locked' => 0,
    'module' => 'image',
    'settings' => array(
      'default_image' => 0,
      'uri_scheme' => 'public',
    ),
    'translatable' => 0,
    'type' => 'image',
  );

  return $field_bases;
}
