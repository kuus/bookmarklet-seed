/**
 * Bookmarklet seed
 *
 * @author kuus <kunderikuus@gmail.com> (http://kunderikuus.net)
 */

(function(window, document, undefined) {

  /**
   * Constants, list jquery, js and css dependencies
   */
  var UNIQUE_PREFIX = 'kuus';
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
  var injectableTemplates = '<div id="kuus-cage"></div><div id="kuus-wrapper"><div id="kuus-wrap" class="kuus-cover"><div id="kuus-header"><div id="kuus-controls"><span id="kuus-control-close" class="kuus-control">x</span> <span id="kuus-control-toggle" class="kuus-control">-</span></div><h1 id="kuus-title">Bookmarklet</h1></div><div id="kuus-container"><div id="kuus-iframe-wrap" class="kuus-cover"><iframe id="kuus-iframe-app" name="kuus-iframe-app" src="javascript:false;" scrolling="0" frameborder="0" sandbox="allow-scripts allow-same-origin" seamless=""></iframe><div id="kuus-iframe-overlay" class="kuus-cover"></div></div></div></div></div>';
  var injectableStyles = '#kuus-cage{z-index:-1;position:fixed;top:0;left:0;bottom:0;right:0;pointer-events:none}#kuus-wrapper{z-index:9999999999;position:fixed!important;top:0;left:0;width:350px;height:100%}#kuus-wrap{position:absolute;border:1px solid #f7f7f7;background:#fff;-webkit-box-shadow:0 16px 28px 0 rgba(0,0,0,.22),0 25px 55px 0 rgba(0,0,0,.21);box-shadow:0 16px 28px 0 rgba(0,0,0,.22),0 25px 55px 0 rgba(0,0,0,.21)}#kuus-header{z-index:1;position:relative;height:30px;border-bottom:1px solid #f7f7f7;background:#ededed;cursor:move;cursor:drag;cursor:grabbing;cursor:-webkit-grabbing;cursor:-moz-grabbing}#kuus-title{float:none;margin:0;padding:5px;line-height:20px;border:0;white-space:nowrap;overflow:hidden;color:#666;text-overflow:ellipsis;text-align:left;text-transform:uppercase;font-family:"Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif;font-size:13px;font-weight:100;letter-spacing:0}#kuus-controls{float:right}#kuus-container{position:absolute;top:30px;bottom:0;left:0;right:0;width:100%}#kuus-iframe-wrap{position:relative}#kuus-iframe-app{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%}#kuus-iframe-overlay{display:none;position:absolute;opacity:0}.kuus-cover{top:0;left:0;width:100%;height:100%}.kuus-control{display:block;float:right;width:30px;height:29px;line-height:30px;background:#ededed;color:#666;text-align:center;font-size:16px;font-family:"Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif;font-weight:100;cursor:pointer}.kuus-control:hover{background:#fcfcfc;color:#444}';
  var injectableApp = '<!doctype html><html><head><style>body{margin:0;padding:0;font:13px/1.3 "Lucida Grande","Lucida Sans Unicode","Lucida Sans",Garuda,Verdana,Tahoma,sans-serif}.cover,#iframe-wrapper{top:0;left:0;width:100%;height:100%}#iframe-wrapper{position:absolute;padding:5px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}#iframe-wrap{position:relative}#iframe-overlay-trap{display:none;position:absolute;opacity:0}#iframe{visibility:visible;position:absolute;padding:0;margin:0}</style><title>Word reference</title></head><body><div id="iframe-wrapper"><div id="iframe-wrap" class="cover"><iframe id="iframe" class="cover" frameborder="0" src="http://wordreference.com/" seamless="" sandbox="allow-forms"></iframe></div></div><script>!function(e,n){function t(){if(f.getSelection){var e=f.getSelection();return e.toString()}if(s.selection.createRange){var e=s.selection.createRange();return e.text}}function r(){l(s).on("mouseup",function(){var e=o(t());e&&e!==d&&c(e)<=2&&(i(e),d=e)})}function o(e){return e.replace(/^\\s\\s*/,"").replace(/\\s\\s*$/,"")}function c(e){return e.match(/\\S+/g).length}function i(e){var n=a.src,t=n.substr(n.lastIndexOf("/")+1),r=t?n.substring(n.lastIndexOf(g)+1,n.lastIndexOf(t)-t.length):"enit";console.log("http://wordreference.com/"+r+"/"+encodeURIComponent(e))}function u(){a=n.getElementById("iframe"),r()}var a,f=e.parent,s=e.parent.document,l=f.jQuery,g="http://wordreference.com/",d="";u()}(window,document);</script></body></html>';

  /**
   * Load jQuery
   * Adapted from here: http://stackoverflow.com/questions/10113366/load-jquery-with-javascript-and-use-jquery
   * @param  {String} url of jquery, as absolute path
   * @param  {Function} callback on jquery ready
   * @return {void}
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
   * @param  {Array} paths of js files
   * @param  {Function} callback called when all scripts are loaded
   * @return {void}
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
   * @param  {Array} paths of css files
   * @return {void}
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
   * @param  {String} css as a string
   * @return {void}
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
   * @param  {Object} event
   * @return {void}
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

  var myBookmarklet = function myBookmarklet() {
    this.initialize.apply(this, arguments);
  };

  // Prototype
  myBookmarklet.prototype = {

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
      var self = this;
      $(controlClose).on('click', self.destroy);
      $(controlToggle).on('click', self.toggle);
      $(header).on('dblclick', self.toggle);
    },
    toggle: function() {
      if(this.minimized) {
        wrapper.style.width = this.size.width + 'px';
        wrapper.style.height = this.size.height + 'px';
        this.className += ' kuus-control-open';
        this.minimized = false;
      } else {
        wrapper.style.height = header.offsetHeight + 'px';
        wrapper.style.width = DEFAULT_WIDTH + 'px';
        this.className = 'kuus-control';
        this.minimized = true;
      }
    },
    destroy: function() {
      this.active = false;
      all.parentNode.removeChild(all);
      window['kuus'] = {};
      delete window['kuus'];
    }
  };

  window['kuus'] = new myBookmarklet();

})(window, document);