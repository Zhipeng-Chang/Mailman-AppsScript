/**
 * This module exports a TextareaCard constructor.
 *
 * @author {@link https://github.com/j-rewerts|Jared Rewerts}
 * @module
 */


var Promise = require('promise');
var Util = require('../util/util');

var textareaHTML = require('./card-textarea.html');
var TitledCard = require('./card-titled.js');
var AutocompleteConfig = require('./autocomplete-config.js');

var serviceFactory = new (require('../ServiceFactory'))();

// Import TinyMCE
var tinymce = require('tinymce/tinymce');

// A theme is also required
require('tinymce/themes/modern/theme');


/**
 * TextareaCards use a multiline input field. They differ from InputCard in this way.
 *
 * @constructor
 * @extends module:client/js/card/card-titled~TitledCard
 * @param {jquery} appendTo The object to append this Card to.
 * @param {Object} options The configuration options for this TextareaCard.
 * @param {String} options.label The label the textarea should have when it has no text.
 * @param {Object} options.autocomplete The autocomplete configuration object. Please see setAutocomplete for a more
 * detailed listing of this Object.
 */
var TextareaCard = function(appendTo, options) {
  TitledCard.call(this, appendTo, options);

  // Private variables
  var self = this;
  var innerBase = $(textareaHTML);
  var validate;
  var textarea = innerBase.find('textarea');
  var acConfig;

  this.init_ = function(appendTo, options) {
    this.append(innerBase);
    acConfig = new AutocompleteConfig(innerBase);

    if (options !== undefined) {
      if (options.label !== undefined) {
        this.setLabel(options.label);
      }
      if (options.autocomplete !== undefined) {
        this.setAutocomplete(options.autocomplete);
      }
    }

    componentHandler.upgradeElement(innerBase[0], 'MaterialTextfield');

    // by default the Mainman settings bar in over top all else, including the
    // rich text editor when it goes full screen. This hides the header when
    // in full screen mode
    var fullscreenFix = function(editor) {
      editor.on('FullscreenStateChanged', function (e) {
        if (e.state) {
          // going fullscreen - we need to hide the header because it overlaps the editor,
          // even if we put z-index higher than the header (flex layouts!).
          $("header[data-id='header']").hide();
        } else {
          // returning from fullscreen
          $("header[data-id='header']").show();
        }
      });
    };
    
   var setupOnPreviewing = function(editor) {
    var renderService = serviceFactory.getRenderService();
    editor.on('Previewing', function (e) {
      if (e.state && e.state.content) {
        e.state.content = renderService.render(e.state.content);        
      }
    });
   };

   var setupSuggestions = function(editor) {
    editor.on('getSuggestions', function (e) {
      $(self).trigger("getSuggestions", e.state);
    });
   };

    tinymce.baseURL = 'https://gdev.edmonton.ca/mailman/tinymce/';
     
    tinymce.init({
      selector: 'textarea',
      toolbar: 'fullscreen | window ',
      menubar: false,
      plugins: 'lists advlist autolink link image charmap paste anchor textcolor table code fullscreen window preview placeholder suggestions',
      skin_url: 'https://cloud.tinymce.com/dev/skins/lightgray',
      setup: function(editor) {
        fullscreenFix(editor);
        setupOnPreviewing(editor);
        setupSuggestions(editor);
      },
      branding: false,
      code_dialog_width: 250,
      plugin_preview_width: 250,
      contextmenu:  "link image inserttable | cell row column deletetable"
    });

  };

  //***** Public Methods *****//

  /**
   * Sets autocomplete based upon some options.
   *
   * @param {Object} options The options to set up autocomplete.
   * @param {String} options.trigger A String that causes autocomplete to drop down.
   * @param {String} options.append A String to append after a selection is made.
   * @param {String} options.prepend A String to prepend to your selection.
   * @param {Number} options.maxResults A Number indicating the maximum number of displayed results.
   * @param {Boolean} options.triggerOnFocus A value indicating whether the autocomplete should trigger when focused.
   * This brings it more in line with the behaviour of a drop down list.
   * @param {Function} options.getter A function that returns a Promise containing values to filter.
   * This function is called with no parameters. If you need params, use f.bind prior to passing it in here.
   */
  this.setAutocomplete = function(options) {
    var append = '';
    var prepend = '';
    var maxResults;
    var trigger;

    if (options.trigger !== undefined) {
      trigger = options.trigger;
    }
    if (options.append !== undefined) {
      append = options.append;
    }
    if (options.prepend !== undefined) {
      prepend = options.prepend;
    }
    if (options.maxResults !== undefined) {
      maxResults = options.maxResults;
    }
    if (options.triggerOnFocus === true) {
      textarea.on('focus', function() {textarea.autocomplete('search', self.getValue())});
    }

    //textarea.autocomplete(acConfig.getAutocompleteConfig(append, prepend, maxResults, trigger, options.getter));
  };

  /**
   * Gets the value in the textarea.
   *
   * @return {String} The value in the textarea.
   */
  this.getValue = function() {
    return tinymce.get(textarea.attr('id')).getContent();
  };

  /**
   * Sets the value of the textarea.
   *
   * @param {String} value The value to set in the textarea.
   */
  this.setValue = function(value) {
    var mce =  tinymce.get(textarea.attr('id'));
    // if tincymce is loaded mce.parser will be something
    if (mce && mce.parser) {
      mce.setContent(value);
    } else {
      textarea.val(value);
    }
  };

  /**
   * Sets the label shown in the textarea when nothing has been typed.
   *
   * @param {String} label The value to set as the label.
   */
  this.setLabel = function(label) {
    $(innerBase).find('textarea').attr('placeholder', label)
  };

  /**
   * Gets the HTMLTextarea object as a jquery object.
   *
   * @return {jquery} The input object.
   */
  this.getTextElement = function() {
    return textarea;
  };
  
  this.setValidation = function(callback) {
    validate = callback;
  };

  this.isValid = function() {
    var body = tinymce.get(textarea.attr('id')).getContent();
    if (!body || 0 === body.length) {
      return false;
    }
    if (validate !== undefined && !validate(self)) {
      return false;
    }

    return true;
  };


  this.init_(appendTo, options);
};


/** */
TextareaCard.prototype.constructor = TextareaCard;
TextareaCard.prototype = Object.create(TitledCard.prototype);


/** */
module.exports = TextareaCard;
