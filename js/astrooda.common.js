var instrument_panel_margin = 150;

Date.prototype.getJulian = function() {
  return Math.floor((this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5);
}

// Sleep time in seconds
function sleep(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration * 1000) { /* do nothing */ }
}

function checkIFrame() {
  try {
    if (window.parent.location.href != null && window.parent.location.href != window.location.href) {
      locationHref = window.parent.location.href;
      // --- in iframe, same domain
      return (2);
    }
    else if (window.parent.location.href != null) {
      // --- not in iframe
      return (1);
    }
  }
  catch (err) {
    // --- permission denied, not in the same domain (iFrameStatus == 0);
    return (0)
  }
  // --- in iframe, not in the same domain (iFrameStatus == 0) ;
  return (0)
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function get_today_mjd() {
  var today = new Date(); // set any date
  var today_mjd = today.getJulian() - 2400000.5; // get Modified Julian
  return (today_mjd);
}

function valid_iso_date(value) {
  var iso_date_pattern = new RegExp("^([1|2]\\d\\d\\d)(?:-?(10|11|12|0\\d)(?:-?(30|31|[0-2]\\d)" +
    "(?:[T ](2[0-3]|[0-1]\\d)(?::?([0-5]\\d)(?::?([0-5]\\d)(?:\\.(\\d+))?)?)?)?)?)?$");
  return (iso_date_pattern.test(value));
}

function valid_mjd_date(value) {
  var mjd_date_pattern = new RegExp("^(\\d+\.?\\d*)$");
  return (mjd_date_pattern.test(value) && value >= 0 && value <= max_mjd_date);
}

function validate_scws(value, nb_scws) {
  // var scws_pattern = new
  // RegExp("^$|^(\\d{12}\\.\\d{3})(\\s*,\\s*\\d{12}\\.\\d{3}){0,"+(nb_scws -
  // 1)+"}$");
  var scws_pattern = new RegExp("^$|^(\\d{12}\\.001)(\\s*,\\s*\\d{12}\\.001){0," + (nb_scws - 1) + "}$");
  if (!scws_pattern.test(value)) {
    return {
      valid: false,
      message: 'Please enter a validdd list of ScWs, maximum ' + nb_scws
    }
  }
  return true;
}

function HMS2Decimal(hmsVal, decimalVal) {
  decimalVal = 0;
  if (hmsVal.match(/^ *$/)) {
    decimalVal = -1;
    return (true);
  }
  var sign = '[+-]?';
  var integer = sign + '\\d{1,3}';
  var decimal_exp = '(\\d\\.\\d*|\\.\\d+)[eE][+-]?\\d{1,3}';
  var decimal = sign + '((\\d{1,3}(\\.\\d*)?|\\.\\d+)|' + decimal_exp + ')';
  var hr_min = sign + '\\d{1,2}[:|\\s]+([0-5]?[0-9](\\.\\d*)?|\\.\\d+)';
  var hr_min_sec = sign + '\\d{1,2}[:|\\s]+([0-5]?[0-9])[:|\\s]+([0-5]?[0-9](\\.\\d*)?|\\.\\d+)';

  var integer_regexp = new RegExp('^(' + integer + ')$');
  var decimal_regexp = new RegExp('^(' + decimal + ')$');
  var hr_min_regexp = new RegExp('^(' + hr_min + ')$');
  var hr_min_sec_regexp = new RegExp('^(' + hr_min_sec + ')$');
  var bad_value = {
    valid: false,
    message: 'Must be in degrees [0,360] or H:M:S'
  };
  if (hmsVal.match(integer_regexp)) { // coordinate is in integral hours
    if (hmsVal * 1 < 25) decimalVal = hmsVal * 15; // return decimal
    // degrees
    else decimalVal = hmsVal * 1;
  } else if (hmsVal.match(decimal_regexp)) { // coordinate is decimal, so
    // assume degrees
    decimalVal = hmsVal * 1; // return decimal degrees
  } else if (hmsVal.match(hr_min_sec_regexp)) {
    var hms = hmsVal.split(/[:|\s]+/);
    if (hms[0].match(/^-/)) { hms[1] *= -1; hms[2] *= -1; }
    decimalVal = (hms[0] * 1 + (hms[1] / 60.0) + (hms[2] / 3600.0)) * 15.0;
  } else if (hmsVal.match(hr_min_regexp)) {
    var hms = hmsVal.split(/[:|\s]+/);
    if (hms[0].match(/^-/)) { hms[1] *= -1; }
    decimalVal = (hms[0] * 1 + (hms[1] / 60.0)) * 15.0;
  } else {
    return (bad_value);
  }

  return (valid_RA(decimalVal) ? true : bad_value);

} // end--HMS2Decimal

function valid_RA(decimalVal) {
  if (decimalVal < -360 || decimalVal > 360) return (false);
  if (decimalVal < 0.0) {
    decimalVal += 360.0;
  } else if (decimalVal == 360.0) {
    decimalVal = 0.0;
  }
  return (true);
} // end--correctRA

function DMS2Decimal(dmsVal, decimalVal) {

  decimalVal = 0;
  if (dmsVal.match(/^ *$/)) {
    decimalVal = -1;
    return (true);
  }

  var sign = '[+-]?';
  var decimal_exp = '(\\d\\.\\d*|\\.\\d+)[eE][+-]?\\d{1,3}';
  var decimal = sign + '((\\d{1,3}(\\.\\d*)?|\\.\\d+)|' + decimal_exp + ')';
  var deg_min = sign + '\\d{1,3}[:|\\s]+([0-5]?[0-9](\\.\\d*)?|\\.\\d+)';
  var deg_min_sec = sign + '\\d{1,3}[:|\\s]+([0-5]?[0-9])[:|\\s]+([0-5]?[0-9](\\.\\d*)?|\\.\\d+)';

  var decimal_regexp = new RegExp('^(' + decimal + ')$');
  var deg_min_regexp = new RegExp('^(' + deg_min + ')$');
  var deg_min_sec_regexp = new RegExp('^(' + deg_min_sec + ')$');
  var bad_value = {
    valid: false,
    message: 'Must be in degrees [-90,+90] or D:M:S'
  };

  if (dmsVal.match(decimal_regexp)) { // coordinate is decimal, so assume
    // degrees
    decimalVal = dmsVal * 1; // return decimal degrees
  } else if (dmsVal.match(deg_min_sec_regexp)) {
    var dms = dmsVal.split(/[:|\s]+/);
    if (dms[0].match(/^-/)) { dms[1] *= -1; dms[2] *= -1; }
    decimalVal = dms[0] * 1 + (dms[1] / 60.0) + (dms[2] / 3600.0);
  } else if (dmsVal.match(deg_min_regexp)) {
    var dms = dmsVal.split(/[:|\s]+/);
    if (dms[0].match(/^-/)) { dms[1] *= -1; }
    decimalVal = dms[0] * 1 + (dms[1] / 60.0);
  } else {
    return (bad_value);
  }
  return (valid_DEC(decimalVal) ? true : bad_value);

} // end--DMS2Decimal

function valid_DEC(decimalVal) {
  if (decimalVal < -90 || decimalVal > 90) return (false);
  return (true);
}

function jsUcfirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function set_panel_resizable(thisPanel) {
  thisPanel.resizable({
  });
}

function clone(old_obj) {
  // Deep copy
  return jQuery.extend(true, {}, old_obj);
}

function copyToClipboard(text) {

  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
  } catch (err) {
  }

  document.body.removeChild(textArea);
}

function add3Dots(field_name, field_description, limit) {
  var dots = '<a href="#" data-toggle="popover" title="' + field_name + '" class="popover-help"> ...</a>';
  if (field_description.length > limit) {
    // you can also use substr instead of substring
    field_description = '<div class="astrooda-popover-content">' + field_description + '</div><span>' + field_description.substring(0, limit) + '</span>' + dots;
  }

  return field_description;
}

function get_current_date_time() {
  var currentdate = new Date();
  return currentdate.getFullYear() + "."
    + ("0" + (currentdate.getMonth() + 1)).slice(-2) + "."
    + ("0" + currentdate.getDate()).slice(-2) + "T"
    + ("0" + currentdate.getHours()).slice(-2) + ":"
    + ("0" + currentdate.getMinutes()).slice(-2) + ":"
    + ("0" + currentdate.getSeconds()).slice(-2);
}

var waitingDialog;

(function($, Drupal) {

  Drupal.ajax.prototype.commands.enable_feedback_form = function(ajax, response, status) {
    $('input,select,textarea', '#lfeedback').prop('disabled', false);
    $('.modal-footer button.cancel-button', '#lfeedback').show();
  }

  Drupal.ajax.prototype.commands.hide_feedback_form = function(ajax, response, status) {
    $('#astrooda-bug-report-form').addClass('hidden');
    $('textarea#edit-comment', '#astrooda-bug-report-form').val('');
    $('.modal-footer button.cancel-button', '#lfeedback').text('Close').show();
    $('.modal-footer button#edit-submit', '#lfeedback').hide();
  }

  Drupal.ajax.prototype.commands.enable_token_form = function(ajax, response, status) {
    $('input,select,textarea', '#ltoken').prop('disabled', false);
    $('.modal-footer button.cancel-button', '#ltoken').show();
  }

  Drupal.ajax.prototype.commands.hide_ask_token_form = function(ajax, response, status) {
    $('input,textarea', '#ltoken').prop('disabled', false);
    $('#astrooda-ask-token-form').addClass('hidden');
    $('textarea#edit-message', '#astrooda-ask-token-form').val('');
    $('.modal-footer button.cancel-button', '#ltoken').text('Close').show();
    $('.modal-footer button#edit-submit--2', '#ltoken').hide();
  }
  Drupal.ajax.prototype.commands.set_ra_dec = function(ajax, response, status) {
    // console.log('response.args');
    // console.log(response.args);
    waitingDialog.hide();
    html = '<div class="alert alert-dismissable">'
      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
      + response.args.message
      + '</div>';
    html = '<small class="" data-bv-validator="callback" data-bv-for="src_name" data-bv-result="INVALID" style="">'
      + response.args.message
      + '</small>';
    elt = $('.form-item-src-name', '#astrooda-common').parent().after(html);
    elt.find('.alert').hide();
    if (response.args.status == 0) {
      if (response.args.ra) {
        $('.form-item-RA input.form-control').val(response.args.ra);
      }
      if (response.args.dec) {
        $('.form-item-DEC input.form-control').val(response.args.dec);
      }
      if (response.args.t1) {
        if ($('select[name="T_format"]', '#astrooda-common').val() == 'isot') {
          $('input[name="T1"]', '#astrooda-common').val(response.args.t1.utc).trigger('input');
          $('input[name="T2"]', '#astrooda-common').val(response.args.t2.utc).trigger('input');
        }
        else {
          $('input[name="T1"]', '#astrooda-common').val(response.args.t1.mjd).trigger('input');
          $('input[name="T2"]', '#astrooda-common').val(response.args.t2.mjd).trigger('input');
        }
      }
      elt.find('.alert').addClass('alert-success').show();
    }
    else {
      $('.form-item-src-name', '#astrooda-common').removeClass('has-success');
      $('.form-item-src-name', '#astrooda-common').addClass('has-error').children('.form-control-feedback').removeClass('glyphicon-ok').addClass('glyphicon-remove');
      $('.form-item-src-name', '#astrooda-common').addClass('has-error');
      elt.find('.alert').addClass('alert-danger').show();
      elt.find('small').addClass('help-block');
      $('.form-item-RA input.form-control').val('');
      $('.form-item-DEC input.form-control').val('');
      // console.log('Error: ' + response.args.message)
    }
    $('form#astrooda-common').bootstrapValidator({ 'live': 'enabled' });
  }
})(jQuery, Drupal);

/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 * 
 * @author Eugene Maslovich <ehpc@em42.ru>
 */

function get_waitingDialog($modal_dialog) {
  var waitingDialog = waitingDialog
    || (function($) {
      'use strict';

      var $dialog = $("#ldialog");
      // Move modal dialog to the end of body
      $dialog.detach().appendTo('body');

      return {
        /**
         * Opens alog
         * 
         * @param message
         *          Custom message
         * @param options
         *          Custom options: options.dialogSize - bootstrap postfix for
         *          dialog size, e.g. "sm", "m"; options.progressType - bootstrap
         *          postfix for progress bar type, e.g. "success", "warning".
         */
        show: function(title, message, options) {
          // Assigning defaults
          if (typeof options === 'undefined') {
            options = {};
          }
          if (typeof title === 'undefined') {
            title = 'Loading ...';
          }
          if (typeof message === 'undefined') {
            message = '';
          }
          var settings = $.extend({
            dialogSize: 'm',
            progressType: '',
            onHide: null,
            showProgressBar: false,
            showSpinner: false,
            showLegend: false,
            showCloseInHeader: false,
            showButton: true,
            buttonText: 'Cancel'
            // This callback runs after the dialog was hidden
          }, options);

          // Configuring dialog
          // $dialog.find('.modal-footer button.bug-button').addClass('hidden');
          $dialog.find('.modal-dialog').attr('class', 'modal-dialog')
            .addClass('modal-' + settings.dialogSize);

          if (!settings.showCloseInHeader) {
            $dialog.find('.modal-header .close').hide();
          }

          if (!settings.showProgressBar) {
            $dialog.find('.progress').addClass('hidden');
          }
          else {
            $dialog.find('.progress').removeClass('hidden');
            $dialog.find('.progress-bar').attr('class', 'progress progress-bar');
            if (settings.progressType) {
              $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
            }
          }

          if (settings.showButton) {
            $dialog.find('button').show();
          }
          else {
            $dialog.find('button').hide();
          }
          $dialog.find('h4').html(title);
          $dialog.find('.summary').html(message);
          $dialog.find('.modal-footer button.submit-button').text(settings.buttonText).addClass(settings.buttonText.toLowerCase() + '-button');

          // Adding callbacks
          if (typeof settings.onHide === 'function') {
            $dialog.off('hidden.bs.modal').on('hidden.bs.modal',
              function(e) {
                settings.onHide.call($dialog);
              });
          }
          if (!settings.showSpinner) {
            $dialog.find('.fa-spinner').addClass('hidden');
          }
          else {
            $dialog.find('.fa-spinner').removeClass('hidden');
          }

          if (!settings.showLegend) {
            $dialog.find('.legend').hide();
          }
          else {
            $dialog.find('.legend').show();
          }
          // Opening dialog
          $dialog.modal({ keyboard: true });
          $dialog.find('.close-panel').on("click", function() {

          });
          // sleep(5);

        },
        /**
         * Closes dialog
         */
        hide: function() {
          $dialog.modal('hide');
          // $dialog.find('.modal-footer button.bug-button').addClass('hidden');
          $('#astrooda_bug_report_form_container', $dialog).addClass('hidden');
        },
        append: function(message, alert_type) {
          // element = $dialog.find('.message');
          var message_class = '';
          if (typeof alert_type !== 'undefined') {
            message_class += 'alert alert-' + alert_type;
          }
          $('.summary', $dialog).append($('<div>' + message + '</div>').addClass(message_class));
          // $('.message', $dialog).animate({scrollTop: $('.message',
          // $dialog).prop("scrollHeight")}, 500);
        },
        replace: function(messages, alert_type) {
          var message_class = '';
          if (typeof alert_type !== 'undefined') {
            message_class += 'alert alert-' + alert_type;
          }
          $('.summary', $dialog).html($('<span>' + messages.summary + '</span>').addClass(message_class));
          $('.details', $dialog).html(messages.details);
          if (messages.details !== '') {
            $('#ldialog .modal-body .more-less-details').show();
          }
        },
        hideSpinner: function() {
          $dialog.find('.fa-spinner').addClass('hidden');
        },
        showSpinner: function() {
          $dialog.find('.fa-spinner').removeClass('hidden');
        },
        setTitle: function(title) {
          $dialog.find('h4').html(title);
        },
        setClose: function(title) {
          $dialog.find('.modal-footer button.submit-button').text('Close');
        },
        showBugReportButton: function(title) {
          $dialog.find('.modal-footer button.bug-button').removeClass('hidden');
          $('#astrooda_bug_report_form_container', $dialog).removeClass('hidden');
        },
        setHeaderMessagesSessionId: function(session_id) {
          $dialog.find('.header-message .session-id').html(session_id);
        },
        setHeaderMessageJobId: function(job_id) {
          $dialog.find('.header-message .job-id').html(job_id);
        },
        showHeaderMessage: function() {
          $dialog.find('.header-message').show();
        },
        hideHeaderMessage: function() {
          $dialog.find('.header-message').hide();
        },
        showLegend: function() {
          $dialog.find('.legend').show();
        },
        hideLegend: function() {
          $dialog.find('.legend').hide();
        }
      };

    })(jQuery);
  return (waitingDialog);
}

(function($) {
  $.fn.set_panel_draggable = function() {
    $(this).draggable({
      handle: '.panel-heading, .panel-footer',
      stack: '.ldraggable',
      containment: "parent"
    });
  }

  $.fn.set_collapsible = function() {
    // $('#'+panel_id + ' .panel-heading span.clickable').on('click',
    // function(e){
    $(this).find('.panel-heading span.clickable').on('click', function(e) {
      var $this = $(this);
      if (!$this.hasClass('panel-collapsed')) {
        $this.closest('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
      }
      else {
        $this.closest('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed'); $this.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
      }
    });
  }

  $.fn.insert_new_panel = function(i, product_type, datetime, left, top) {
    var panel_id = product_type + '-wrapper-' + i;
    var panel_body_id = product_type + '-' + i;

    $result_panel = $('#astrooda_panel_model').clone();
    $result_panel.attr('id', panel_id);
    $result_panel.find('.date').text('[' + datetime + ']');
    $result_panel.find('.panel-body').attr('id', panel_body_id);

    // $($result_panel).insertAfter(insertAfter);
    $(this).after($result_panel);
    if (left) {
      $result_panel.css('left', left + 'px');
    }
    if (top) {
      $result_panel.css('top', top + 'px');
    }

    $('#' + panel_id).set_panel_draggable();
    $('#' + panel_id).set_collapsible();
    return ({ 'panel_id': panel_id, 'panel_body_id': panel_body_id });
  }

  $.fn.highlight_result_panel = function(offset) {
    max_zindexes = Math.max.apply(Math, $('.ldraggable').map(function() { return parseInt($(this).zIndex()); }).get());
    $(this).css('z-index', max_zindexes + 1);
    var thisObject = $(this);
    instrument_panel = $(this).closest('.instrument-panel');

    if (offset) {
      $(this).offset(offset);
      thisObject.show('highlight', { color: '#adebad' }, 1000);
      var instrument_panel_resized_height = thisObject.height() + thisObject.offset().top + instrument_panel_margin;
      if (instrument_panel_resized_height > instrument_panel.height()) {
        instrument_panel.height(instrument_panel_resized_height);
      }
    }
    else {
      position_left = parseInt(($(this).parent().width() - $(this).width()) / 2);
      $(this).css('left', position_left);

      var y = instrument_panel.position().top - 100;
      // console.log('y: '+y);

      $('body').animate({ 'scrollTop': y + 'px' }, 500, function() {
        // Animation complete.
        thisObject.show('highlight', { color: '#adebad' }, 1000);
        var instrument_panel_resized_height = thisObject.height() + thisObject.offset().top + instrument_panel_margin;
        // resize instrument panel to fit the product panel
        if (instrument_panel_resized_height > instrument_panel.height()) {
          instrument_panel.height(instrument_panel_resized_height);
        }
      });
    }
  }

  $(document).ready(commonReady);

  function validate_date(value, validator, thefield) {
    max_mjd_date = get_today_mjd();
    // var time_format_type = $('select[name="T_format"]',
    // 'form#astrooda-common').val();
    var time_format_type = validator.getFieldElements('T_format').val();

    if (time_format_type == 'isot' && !valid_iso_date(value)) {
      return {
        valid: false,
        message: 'Please enter a valid UTC ISO date, YYYY-MM-DDThh:mm:ss.s'
      }
    }
    else if (time_format_type == 'mjd' && !valid_mjd_date(value)) {
      return {
        valid: false,
        message: 'Please enter a valid MJD date <span style="white-space: nowrap;">[0, ' + max_mjd_date + ']</span>'
      }
    }
    return true;
  }

  function commonReady() {
    if (Drupal.settings.user_uid == 0) {
      $('.main-toolbar .login-link').show();
      $('.main-toolbar .logout-link').hide();
    }
    else {
      $('.main-toolbar .login-link').hide();
      $('.main-toolbar .logout-link').show();
    }
/*
    $('.main-toolbar .user-log').on('click', function() {
      $('.main-toolbar .user-log').toggle();
    });
*/
    $(document).on('show.bs.modal', '.modal', function() {
      var zIndex = 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function() {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    });

    $('#astrooda-common').submit(function(event) {
      var $target = $(event.target);
      if ($target.is('input[type=submit]')) {
        return true;
      }
      return false;
    });

    var iframeStatus = checkIFrame();
    // iframeStatus = 0 Astrooda in iframe, iframe and parent are not on the
    // same domain
    // iframeStatus = 1 Astrooda not in iframe
    // iframeStatus = 2 Astrooda in iframe, iframe and parent are on the same
    // domain
    if (iframeStatus > 0 && (window.parent.location.search || window.location.search)) {
      var thelocation;
      var url_base;
      thelocation = window.parent.location;
      url_base = thelocation.protocol + "//"
        + thelocation.hostname + thelocation.pathname;
      // redirect to astrooda base url to get rid of the parameters
      thelocation.replace(url_base);
    }

    // A cross symbol after an input to clear it
    $('.clear-left-input').on('click', function(e) {
      $(this).parent().prev('input').val('');
    });

    $('body').tooltip({
      selector: '[data-toggle="tooltip"]'
    });

    $('.form-item .description').each(function() {
      $(this).html(add3Dots($(this).parent().find('label:first').html(), $(this).html(), 240));
    });
    $('.popover-help').on('click', function(e) { e.preventDefault(); return true; }).popover({
      container: 'body',
      content: function() { return $(this).parent().find('.astrooda-popover-content').html(); },
      html: true,
      template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h4 class="popover-title"></h4><div class="popover-content"></div></div>'
    });

    $('.popover-error').on('click', function(e) { e.preventDefault(); return true; }).popover({
      container: 'body',
      content: function() { return $(this).parent().find('.astrooda-popover-content').html(); },
      html: true,
      template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h4 class="popover-title"></h4><div class="popover-content"></div></div>'
    });

    $(document).on('click', function(e) {
      $('[data-toggle="popover"],[data-original-title]').each(function() {
        // the 'is' for buttons that trigger popups
        // the 'has' for icons within a button that triggers a popup
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
          (($(this).popover('hide').data('bs.popover') || {}).inState || {}).click = false  // fix
          // for
          // BS
          // 3.3.6
        }

      });
    });

    $('#block-views-oda-events-block-1').set_collapsible();
    waitingDialog = get_waitingDialog();

    function openPageInModal(href) {
      $.get(href, function(data) {
        html = $.parseHTML(data),
          waitingDialog.show('', $(html).filter('.main-container').html(), {
            dialogSize: 'lg',
            buttonText: 'Close',
            showCloseInHeader: true,
          })
      })
    }
    $('.find-more-button').not('.find-more-button-processed').addClass('find-more-button-processed').on('click', function(e) {
      Drupal.eu_cookie_compliance.moreInfoAction;
    });

    $('.eu-cookie-compliance-more-button').off('click').on('click', function(e) {
      ;
      if (Drupal.settings.eu_cookie_compliance.disagree_do_not_show_popup) {
        Drupal.eu_cookie_compliance.setStatus(0);
        if (Drupal.settings.eu_cookie_compliance.withdraw_enabled && Drupal.settings.eu_cookie_compliance.withdraw_button_on_info_popup) {
          $('#sliding-popup .eu-cookie-compliance-banner').trigger('eu_cookie_compliance_popup_close').hide();
          $('body').removeClass('eu-cookie-compliance-popup-open');
        }
        else {
          $('#sliding-popup').trigger('eu_cookie_compliance_popup_close').remove();
          $('body').removeClass('eu-cookie-compliance-popup-open');
        }
      }
      else {
        openPageInModal(Drupal.settings.eu_cookie_compliance.popup_link);
      }
    });

    $('.oda-banner .views-more-link, .oda-banner .views-slideshow-pager-field-item a, .oda-banner .views-field-title a, a.open-link-modal').on('click', function(e) {
      e.preventDefault();
      openPageInModal($(this).attr('href'));
    });

    $(document).ajaxSend(function(event, jqxhr, settings) {
      if (settings.hasOwnProperty('extraData') && settings.extraData.hasOwnProperty('_triggering_element_name') && settings.extraData._triggering_element_name == 'resolve_name') {
        var message = 'Resolving object name ...';
        waitingDialog.show('', message, {
          progressType: 'success',
          'showProgress': true,
          'showButton': false
        });
        waitingDialog.hideHeaderMessage();
        $('.form-item-src-name', '#astrooda-common').parent().parent().find('small').remove();
        $('.form-item-RA input.form-control').val('');
        $('.form-item-DEC input.form-control').val('');
        $('input:not(:file)', '#astrooda-common').val(function(_, value) {
          return $.trim(value.replace(/\s+/g, " "));
        });
      }
      else if (settings.hasOwnProperty('extraData') && settings.extraData.hasOwnProperty('_triggering_element_name') && settings.extraData._triggering_element_name == 'send-feedback-button') {
        $('.modal-footer button.cancel-button', '#lfeedback').hide();
        $('input,select,textarea', '#lfeedback').prop('disabled', true);
        $('#feedback-messages', '#lfeedback').html('');
      }
      else if (settings.hasOwnProperty('extraData') && settings.extraData.hasOwnProperty('_triggering_element_name') && settings.extraData._triggering_element_name == 'ask-token-button') {
        $('.modal-footer button.cancel-button', '#ltoken').hide();
        $('#token-messages', '#ltoken').html('');
        $('input,select,textarea', '#ltoken').prop('disabled', true);
      }

    });

    // Disable main submit if error in common parameters
    $('input, select, textarea', '#astrooda-common').on('error.field.bv', function() {
      // Disabling submit
      $('[type="submit"]', '.instrument-panel').prop('disabled', true);
    }).on('success.field.bv', function() {
      // Enabling submit')
      $('[type="submit"]', '.instrument-panel').prop('disabled', false);

    });

    $('select[name="T_format"]', '#astrooda-common').on('change', function() {
      $('input[name="T1"]', '#astrooda-common').trigger('input');
      $('input[name="T2"]', '#astrooda-common').trigger('input');
    });

    $('.instrument-panel').resizable({
      handles: 's'
    });
    $('.instrument-params-panel').set_panel_draggable();

    // Create validator and validate a frist time :
    // This is important in Firefox when the page is refreshed
    // where indeed the old values are still in the form

    var validator = $('form#astrooda-common').bootstrapValidator({
      // live :'disabled',
      fields: {
        'RA': {
          // enabled: false,
          validators: {
            callback: {
              callback: function(value, validator, $field) {
                var decimalRA;
                return (HMS2Decimal(value, decimalRA));
              }
            }
          }
        },
        'DEC': {
          // enabled: false,
          validators: {
            callback: {
              callback: function(value, validator, $field) {
                var decimalDEC;
                return (DMS2Decimal(value, decimalDEC));
              }
            }
          }
        },
        'T1': {
          // enabled: false,
          validators: {
            callback: {
              callback: function(value, cbvalidator, $field) {
                return (validate_date(value, cbvalidator, $field));
              }
            }
          }
        },
        'T2': {
          // enabled: false,
          validators: {
            callback: {
              callback: function(value, cbvalidator, $field) {
                return (validate_date(value, cbvalidator, $field));
              }
            }
          }
        }
      },
      feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
      },
    }).data('bootstrapValidator'); // .validate();

    // if (! validator.isValid()) {
    // console.log('disabling submit');
    // validator.disableSubmitButtons(true);
    // }
  }

})(jQuery);

function cloneFormData(formData1) {
  formData2 = new FormData();
  for (var parameter of formData1.entries()) {
    formData2.append(parameter[0], parameter[1]);
  }
  return (formData2);
}

function get_text_table(table) {
  if (!table.hasOwnProperty('column_names')) {
    return '';
  }
  var header = '<tr>';
  for (var i = 0; i < table.column_names.length; i++) {
    header += '<th>' + table.column_names[i] + '</th>';
  }
  header += '</tr>';
  var body = '';
  for (var j = 0; j < table.columns_list[0].length; j++) {
    body += '<tr>';
    for (var i = 0; i < table.columns_list.length; i++) {
      body += '<td>' + table.columns_list[i][j] + '</td>';
    }
    body += '</tr>';
  }
  var html = '<table class="spectrum-text-table"><thead>' + header
    + '</thead><tbody>' + body + '</tbody></table>';
  return (html);
}

function round_catalog_values(catalog) {
  for (var j = 0; j < catalog.cat_column_list[0].length; j++) {
    // Round significance to 1 digit
    catalog.cat_column_list[2][j] = catalog.cat_column_list[2][j].toFixed(1);
    // Round RA to 4 digits
    catalog.cat_column_list[3][j] = catalog.cat_column_list[3][j].toFixed(4);
    // Round DEC to 4 digits
    catalog.cat_column_list[4][j] = catalog.cat_column_list[4][j].toFixed(4);
    // Round ERR_RAD to 4 digits
    catalog.cat_column_list[8][j] = catalog.cat_column_list[8][j].toFixed(4);
  }
}



