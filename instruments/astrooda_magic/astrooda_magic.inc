<?php

/**
 * @file
 * Provides a block displaying prayer times for the visitor's location
 */

/**
 */
function astrooda_magic($form, &$form_state) {

  $form = array ();

  $form ['#tree'] = FALSE;
  //turn off form caching
  $mform_id= __FUNCTION__.'_';

  $form ['#action'] = 'dispatch-data/run_analysis';
  $form ['#method'] = 'POST';
  $form['#attributes'] = array('class' => 'magic-form');

  $form ['instrument'] = array (
      '#type' => 'hidden',
      '#value' => 'magic'
  );

  $astrooda_settings = variable_get('astrooda_settings');
  error_log(print_r($astrooda_settings, true));
  $instrument_defaults= $astrooda_settings['instruments']['magic'];

  $form ['query_type'] = array (
      '#type' => 'select',
      '#title' => t ( "Query Type" ),
      '#description' => t ( "Select query type" ),
      '#default_value' => $instrument_defaults['query_type'],
      '#options' => array (
          'Real' => 'Real',
          'Dummy' => 'Dummy'
      ),
      '#parent_classes' => array (
          'form-group',
          'col-md-6'
      ),
      '#label_classes' => array (
          'control-label'
      ),
      '#attributes' => array (
          'class' => array (
              'form-control'
          )
      ),
      '#prefix' => '<div class="row">',
      '#suffix' => '</div><hr class="hr-default" />',
  );

  $form ['radius'] = array (
      '#type' => 'textfield',
      '#title' => t ( "Radius" ),
      '#default_value' => $instrument_defaults['radius'],
      '#parent_classes' => array (
          'form-group',
          'col-md-6'
      ),
      '#label_classes' => array (
          'control-label'
      ),
      '#attributes' => array (
          'class' => array (
              'form-control'
          ),
          'data-bv-numeric' => 'true'
      ),
      '#prefix' => '<div class="row">',
      '#suffix' => '</div><hr class="hr-default" />',
  );


  $form ['product_type'] = array (
      '#type' => 'radios',
      '#title' => t ( "Product Type" ),
      '#description' => t ( "Select product type" ),
      '#attributes' => array ('name' => $mform_id.'product_type'),
      '#default_value' => $instrument_defaults['product_type'],
      '#options' => array (
          'magic_image' => 'Image',
          'magic_spectrum' => 'Spectrum',
          'magic_lc' => 'Light curve',
          'magic_table' => 'Table'
      ),
      '#parent_classes' => array (
          'form-group',
          'col-md-6'
      ),
      '#label_classes' => array (
          'control-label'
      ),
      '#prefix' => '<div class="row">',
      '#suffix' => '</div>'
  );

  $form ['submit'] = array (
      '#type' => 'submit',
      '#value' => t ( 'Submit' ),
  );

  form_load_include ( $form_state, 'inc', 'astrooda', 'astrooda.magic' );


  return ($form);
}
