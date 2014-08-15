/**
 * bookmarklet-seed v0.0.1
 * http://github.com/kuus/bookmarklet-seed
 *
 * Seed to easily start and develop a draggable and resizable bookmarklet. Using gulp to help the workflow.
 *
 * Copyright (c) 2014 kuus <kunderikuus@gmail.com> (http://github.com/kuus/)
 * Released under MIT License
 */
/**
 * bookmarklet-seed
 * http://github.com/kuus/bookmarklet-seed
 *
 * Copyright (c) 2014 kuus <kunderikuus@gmail.com> (http://github.com/kuus/)
 * Released under MIT License
 */

(function(window, document, undefined) {

  /**
   * Constants, list jquery, js and css dependencies
   */
  var UNIQUE_PREFIX = 'kuusbkmrkletsd';
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
  var cage;
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
  var injectableTemplates = '<div id="kuusbkmrkletsd-cage"></div><div id="kuusbkmrkletsd-wrapper" class="kuusbkmrkletsd-cover"><div id="kuusbkmrkletsd-header"><div id="kuusbkmrkletsd-controls"><span id="kuusbkmrkletsd-control-close" class="kuusbkmrkletsd-control">&times;</span> <span id="kuusbkmrkletsd-control-toggle" class="kuusbkmrkletsd-control-toggle kuusbkmrkletsd-control-toggle-open kuusbkmrkletsd-control"></span></div><h1 id="kuusbkmrkletsd-title">Bookmarklet</h1></div><div id="kuusbkmrkletsd-container"><div id="kuusbkmrkletsd-iframe-wrap" class="kuusbkmrkletsd-cover"><iframe id="kuusbkmrkletsd-iframe-app" name="kuusbkmrkletsd-iframe-app" src="javascript:false;" scrolling="0" frameborder="0" sandbox="allow-scripts allow-same-origin" seamless=""></iframe><div id="kuusbkmrkletsd-iframe-overlay" class="kuusbkmrkletsd-cover"></div></div></div></div>';
  var injectableStyles = '#kuusbkmrkletsd-cage{z-index:-1;position:fixed;top:0;left:0;bottom:0;right:0;pointer-events:none}#kuusbkmrkletsd-wrapper{z-index:9999999999;position:fixed!important;top:0;left:0;width:350px;height:100%;-webkit-transition:opacity .3s ease;transition:opacity .3s ease;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;border:1px solid #b3b3b3!important;background:#fff;-webkit-box-shadow:0 16px 28px 0 rgba(0,0,0,.22),0 25px 55px 0 rgba(0,0,0,.21);box-shadow:0 16px 28px 0 rgba(0,0,0,.22),0 25px 55px 0 rgba(0,0,0,.21)}#kuusbkmrkletsd-header{z-index:1;position:relative;height:30px;border-bottom:1px solid #e0e0e0;background:#ededed;-webkit-box-shadow:0 0 10px rgba(0,0,0,.04);box-shadow:0 0 10px rgba(0,0,0,.04);cursor:move;cursor:drag;cursor:grabbing;cursor:-webkit-grabbing;cursor:-moz-grabbing}#kuusbkmrkletsd-title{float:none;margin:0;padding:5px;line-height:20px;border:0;white-space:nowrap;overflow:hidden;color:#666;text-overflow:ellipsis;text-align:left;text-transform:uppercase;font-family:"Open Sans","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif!important;font-size:13px;font-weight:100;letter-spacing:0}#kuusbkmrkletsd-controls{float:right}#kuusbkmrkletsd-container{position:absolute;top:30px;bottom:0;left:0;width:100%}#kuusbkmrkletsd-iframe-wrap{position:relative}#kuusbkmrkletsd-iframe-app{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;border:0!important;padding:0!important;max-width:none!important}#kuusbkmrkletsd-iframe-overlay{display:none;position:absolute;opacity:0}.kuusbkmrkletsd-cover{top:0;left:0;width:100%;height:100%}.kuusbkmrkletsd-control{display:block;float:right;width:30px;height:29px;line-height:30px;background:#ededed;color:#666;text-align:center;font-size:16px;font-family:"Open Sans","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif!important;font-weight:100;cursor:pointer}.kuusbkmrkletsd-control:hover{z-index:1;position:relative;background:#f0f0f0;color:#444;-webkit-box-shadow:0 0 30px rgba(0,0,0,.1);box-shadow:0 0 30px rgba(0,0,0,.1)}.kuusbkmrkletsd-control-toggle:before{content:"\\002B"}.kuusbkmrkletsd-control-toggle-open:before{content:"\\002D"}.ui-resizable,.ui-resizable-se{border:0!important}';
  var injectableApp = '<!doctype html><html><head><style>html{height:100%}body{margin:0;padding:0;font:13px/1.3 "Open Sans","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif;text-align:center;color:#777}body,body:before{height:100%;vertical-align:middle}body:before{content:\'\';display:inline-block}h1{font-weight:100}a{text-decoration:none;color:#666;letter-spacing:0;-webkit-transition:letter-spacing .2s ease;transition:letter-spacing .2s ease}a:active,a:hover{text-decoration:underline;letter-spacing:3px;color:#666}.content{vertical-align:middle;display:inline-block;padding:15px}</style><link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:300"><title>Example app</title></head><body><div class="content"><h1>Just a sample app</h1><p>You can minimize me, resize me, and drag around (dragging the header on top). Take in consideration that here we are inside an iframe (\'without\' "src"), so I don\'t inherit css from the parent page.</p><img src="https://raw.githubusercontent.com/kuus/frontend-tools/master/images/yeoman.png" width="180"><p>built by <a href="https://github.com/kuus">kuus</a></p></div><script>!function(o){var n=o.parent;o.parent.document,n.jQuery,console.log("ciao from your bookmarklet app")}(window);</script></body></html>';

  /**
   * Load jQuery
   * Adapted from here: http://stackoverflow.com/questions/10113366/load-jquery-with-javascript-and-use-jquery
   * @param {string} url of jquery, as absolute path
   * @param {Function} callback on jquery ready
   */
  function loadJquery(url, onReady) {
    // regex to get only number comman and dots
    // ^[0-9]{1,2}([,.][0-9]{1,2})?$
    // get jquery version
    // jQuery.fn.jquery

    if (typeof window.jQuery == 'undefined') {
      // Poll for jQuery to come into existance
      var checkReady = function() {
        if (window.jQuery) {
          $ = window.jQuery;
          onReady();
        } else {
          window.setTimeout(function() {
            checkReady();
          }, 100);
        }
      };
      var script = document.createElement('script')
      script.type = 'text/javascript';
      if (script.readyState) { // IE
        script.onreadystatechange = function() {
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
  function loadScripts(paths, callback) {
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
  function loadStyles(paths, callback) {
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
  function injectCss(css) {
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
  function preventScrollBubbling(event) {
    var scrollTop = this.scrollTop,
      scrollHeight = this.scrollHeight,
      height = this.offsetHeight,
      delta = event.originalEvent.wheelDelta,
      up = delta > 0;

    var prevent = function() {
      event.stopPropagation();
      event.preventDefault();
      event.returnValue = false;
      return false;
    }

    if (!up && -delta > scrollHeight - height - scrollTop) {
      // Scrolling down, but this will take us past the bottom.
      this.scrollTop = scrollHeight;
      return prevent();
    } else if (up && delta > scrollTop) {
      // Scrolling up, but this will take us past the top.
      this.scrollTop = 0;
      return prevent();
    }
  }

  var Bookmarklet = function Bookmarklet() {
    this.initialize.apply(this, arguments);
  };

  /**
   * The bookmarklet prototype
   * @type {Object}
   */
  Bookmarklet.prototype = {

    initialize: function() {
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
      loadJquery(DEPENDENCIES.jquery.desired, function() {
        injectCss(injectableStyles);
        loadStyles(DEPENDENCIES.css);
        // here so we have jquery
        self.bindControls();
        // and the inner app also gets it
        self.initInnerApp();
        loadScripts(DEPENDENCIES.js, function() {
          self.initDrag();
        })
      });
    },
    createDom: function() {
      var fragment = document.createDocumentFragment();
      all = document.createElement('div');
      all.id = allId;
      all.innerHTML = injectableTemplates;
      fragment.appendChild(all);
      document.body.appendChild(fragment);
      this.assignDom();
    },
    assignDom: function() {
      wrapper = document.getElementById(wrapperId);
      iframeAppOverlay = document.getElementById(iframeAppOverlayId);
      header = document.getElementById(headerId);
      title = document.getElementById(titleId);
      controlClose = document.getElementById(controlCloseId);
      controlToggle = document.getElementById(controlToggleId);
      iframeApp = document.getElementById(iframeAppId);
    },
    initInnerApp: function() {
      var self = this;
      //http://stackoverflow.com/questions/10418644/creating-an-iframe-with-given-html-dynamically
      // iframeApp.src = "data:text/html;charset=utf-8," + escape(injectableApp);
      iframeApp.contentWindow.document.open();
      iframeApp.contentWindow.document.write(injectableApp);
      iframeApp.contentWindow.document.close();
      iframeApp.onload = function() {
        self.setTitle(iframeApp.contentDocument.title);
      }
    },
    setTitle: function(str) {
      title.innerHTML = str;
    },
    initDrag: function() {
      var self = this,
        minWidth = this.size.width,
        onStart = function() {
          // cover iframe
          iframeAppOverlay.style.display = 'block';
        },
        onStop = function(event, ui) {
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
      .on('DOMMouseScroll mousewheel', preventScrollBubbling);
    },
    bindControls: function() {
      $(controlClose).on('click', $.proxy(this.destroy, this));
      $(controlToggle).on('click', $.proxy(this.toggle, this));
      $(header).on('dblclick', $.proxy(this.toggle, this));
    },
    toggle: function(event) {
      var $element = $(event.target);
      if(this.minimized) {
        wrapper.style.width = this.size.width + 'px';
        wrapper.style.height = this.size.height + 'px';
        $element.addClass('kuusbkmrkletsd-control-toggle-open');
        this.minimized = false;
      } else {
        wrapper.style.height = header.offsetHeight + 'px';
        wrapper.style.width = DEFAULT_WIDTH + 'px';
        $element.removeClass('kuusbkmrkletsd-control-toggle-open');
        this.minimized = true;
      }
    },
    destroy: function() {
      this.active = false;
      all.parentNode.removeChild(all);
      window['kuusbkmrkletsd'] = {};
      delete window['kuusbkmrkletsd'];
    }
  };

  // Expose the Bookmarklet
  window['kuusbkmrkletsd'] = new Bookmarklet();

})(window, document);