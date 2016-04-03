/**
 * bookmarklet-seed
 * http://github.com/kuus/bookmarklet-seed
 *
 * Copyright (c) 2014 kuus <kunderikuus@gmail.com> (http://github.com/kuus/)
 * Released under MIT License
 */

(function (window, document, undefined) {

  'use strict';

  /**
   * Constants, list jquery, js and css dependencies
   */
  var UNIQUE_PREFIX = 'UNIQUEID';
  var DEFAULT_WIDTH = 350;
  var DEPENDENCIES = {
    jquery: {
      min: '>1.8',
      desired: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'
    },
    js: [
      '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js',
      '//rawgit.com/polomoshnov/jQuery-UI-Resizable-Snap-extension/master/jquery.ui.resizable.snap.ext.v1.9.min.js'
    ],
    css: [
      '//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css'
    ]
  };

  /**
   * An internal jquery
   */
  var $;

  /**
   * DOM variables, id and elements
   */
  var all;
  var allId = UNIQUE_PREFIX;
  var cageId = UNIQUE_PREFIX + '-cage';
  var wrapper;
  var wrapperId = UNIQUE_PREFIX + '-wrapper';
  var iframeApp;
  var iframeAppId = UNIQUE_PREFIX + '-iframe-app';
  var iframeAppOverlay;
  var iframeAppOverlayId = UNIQUE_PREFIX + '-iframe-overlay';
  var header;
  var headerId = UNIQUE_PREFIX + '-header';
  var title;
  var titleId = UNIQUE_PREFIX + '-title';
  var controlClose;
  var controlCloseId = UNIQUE_PREFIX + '-control-close';
  var controlToggle;
  var controlToggleId = UNIQUE_PREFIX + '-control-toggle';

  /**
   * Injectables
   * kind of external resource, filled by gulp tasks
   */
  var injectableTemplates = '<!-- inject:templates -->';
  var injectableStyles = '<!-- inject:styles -->';
  var injectableApp = '<!-- inject:app -->';

  /**
   * Load jQuery
   * Adapted from here: http://stackoverflow.com/questions/10113366/load-jquery-with-javascript-and-use-jquery
   * @param {string} url of jquery, as absolute path
   * @param {Function} callback on jquery ready
   */
  function loadJquery (url, onReady) {
    // regex to get only number comman and dots
    // ^[0-9]{1,2}([,.][0-9]{1,2})?$
    // get jquery version
    // jQuery.fn.jquery

    if (typeof window.jQuery == 'undefined') {
      // Poll for jQuery to come into existance
      var checkReady = function () {
        if (window.jQuery) {
          $ = window.jQuery;
          onReady();
        } else {
          window.setTimeout(function () {
            checkReady();
          }, 100);
        }
      };
      var script = document.createElement('script');
      script.type = 'text/javascript';
      if (script.readyState) { // IE
        script.onreadystatechange = function () {
          if (script.readyState == 'loaded' || script.readyState == 'complete') {
            script.onreadystatechange = null;
            checkReady();
          }
        };
      } else { // Others
        script.onload = function() {
          checkReady();
        };
      }
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    } else {
      $ = window.jQuery;
      onReady();
    }
  }

  /**
   * Load js files, use jquery
   * @param {Array} paths of js files
   * @param {Function} callback called when all scripts are loaded
   */
  function loadScripts (paths, callback) {
    var received = 0;
    var pathsLength = paths.length;
    var realCallback = function() {
      received++;
      if (received === pathsLength) {
        callback();
      }
    };
    for (var i = 0; i < pathsLength; i++) {
      $.getScript(paths[i], realCallback);
    }
  }

  /**
   * Load css files
   * @param {Array} paths of css files
   */
  function loadStyles (paths) {
    var head = document.getElementsByTagName('head')[0];
    for (var i = 0, l = paths.length; i < l; i++) {
      var link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = paths[i];
      head.appendChild(link);
    }
  }

  /**
   * Inject css rules
   * as seen here: http://stackoverflow.com/a/524721
   * @param {string} css as a string
   */
  function injectCss (css) {
    var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  }

  /**
   * Prevent the default behavior of passing
   * the scroll event to parent scrollable areas.
   * Adapted from: http://stackoverflow.com/a/16324762
   * @param {Object} event
   */
  function preventScrollBubbling (event, element) {
    var scrollTop = element.scrollTop,
      scrollHeight = element.scrollHeight,
      height = element.offsetHeight,
      delta = event.originalEvent.wheelDelta,
      up = delta > 0;

    var prevent = function() {
      event.stopPropagation();
      event.preventDefault();
      event.returnValue = false;
      return false;
    };

    if (!up && -delta > scrollHeight - height - scrollTop) {
      // Scrolling down, but this will take us past the bottom.
      element.scrollTop = scrollHeight;
      return prevent();
    } else if (up && delta > scrollTop) {
      // Scrolling up, but this will take us past the top.
      element.scrollTop = 0;
      return prevent();
    }
  }

  var Bookmarklet = function Bookmarklet () {
    this.initialize.apply(this, arguments);
  };

  /**
   * The bookmarklet prototype
   * @type {Object}
   */
  Bookmarklet.prototype = {

    initialize: function () {
      var self = this;
      this.active = true;
      this.position = {
        top: 0,
        left: 0
      };
      this.size = {
        width: DEFAULT_WIDTH,
        height: window.innerHeight
      };
      this.active = false;
      this.createDom();
      loadJquery(DEPENDENCIES.jquery.desired, function () {
        injectCss(injectableStyles);
        loadStyles(DEPENDENCIES.css);
        // here so we have jquery
        self.bindControls();
        // and the inner app also gets it
        self.initInnerApp();
        loadScripts(DEPENDENCIES.js, function () {
          self.initDrag();
        });
      });
    },
    createDom: function () {
      var fragment = document.createDocumentFragment();
      all = document.createElement('div');
      all.id = allId;
      all.innerHTML = injectableTemplates;
      fragment.appendChild(all);
      document.body.appendChild(fragment);
      this.assignDom();
    },
    assignDom: function () {
      wrapper = document.getElementById(wrapperId);
      iframeAppOverlay = document.getElementById(iframeAppOverlayId);
      header = document.getElementById(headerId);
      title = document.getElementById(titleId);
      controlClose = document.getElementById(controlCloseId);
      controlToggle = document.getElementById(controlToggleId);
      iframeApp = document.getElementById(iframeAppId);
    },
    initInnerApp: function () {
      var self = this;
      //http://stackoverflow.com/questions/10418644/creating-an-iframe-with-given-html-dynamically
      // iframeApp.src = "data:text/html;charset=utf-8," + escape(injectableApp);
      iframeApp.contentWindow.document.open();
      iframeApp.contentWindow.document.write(injectableApp);
      iframeApp.contentWindow.document.close();
      iframeApp.onload = function () {
        self.setTitle(iframeApp.contentDocument.title);
      };
    },
    setTitle: function (str) {
      title.innerHTML = str;
    },
    initDrag: function () {
      var self = this,
        minWidth = this.size.width,
        onStart = function () {
          // cover iframe
          iframeAppOverlay.style.display = 'block';
        },
        onStop = function (event, ui) {
          self.position = ui.position;
          self.size = ui.size ? ui.size : self.size;
          // uncover iframe
          iframeAppOverlay.style.display = 'none';
        };
      // draggable: jquery ui
      $(wrapper).draggable({
        containment: '#' + cageId,
        scroll: false,
        snap: '#' + cageId,
        snapTolerance: 20,
        snapMode: 'inner',
        opacity: 0.8,
        start: onStart,
        stop: onStop
      })
      // resizable: jquery ui
      .resizable({
        containment: '#' + cageId,
        maxWidth: 768,
        minWidth: minWidth,
        minHeight: header.offsetHeight,
        handles: 'all',
        snap: '#' + cageId,
        snapTolerance: 20,
        snapMode: 'inner',
        start: onStart,
        stop: onStop
      })
      // prevent scroll bubbling to parent document
      .on('DOMMouseScroll mousewheel', function (event) {
        preventScrollBubbling(event, this);
      });
    },
    bindControls: function () {
      $(controlClose).on('click', $.proxy(this.destroy, this));
      $(controlToggle).on('click', $.proxy(this.toggle, this));
      $(header).on('dblclick', $.proxy(this.toggle, this));
    },
    toggle: function (event) {
      var $element = $(event.target);
      if(this.minimized) {
        wrapper.style.width = this.size.width + 'px';
        wrapper.style.height = this.size.height + 'px';
        $element.addClass('UNIQUEID-control-toggle-open');
        this.minimized = false;
      } else {
        wrapper.style.height = header.offsetHeight + 'px';
        wrapper.style.width = DEFAULT_WIDTH + 'px';
        $element.removeClass('UNIQUEID-control-toggle-open');
        this.minimized = true;
      }
    },
    destroy: function () {
      this.active = false;
      all.parentNode.removeChild(all);
      window.UNIQUEID = {};
      delete window.UNIQUEID;
    }
  };

  // Expose the Bookmarklet
  window.UNIQUEID = new Bookmarklet();

})(window, document);
