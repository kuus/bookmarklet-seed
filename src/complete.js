/**
 * Bookmarklet skeleton
 *
 * @author kuus <kunderikuus@gmail.com> (http://kunderikuus.net)
 */
(function() {

  var myBookmarklet = function myBookmarklet() {
    this.initialize.apply(this, arguments);
  };

  var UNIQUE_PREFIX = 'kuus';

  /**
   * List jquery, js and css dependencies
   * @type {Object}
   */
  var DEPENDENCIES = {
    jquery: {
      min: '>1.7',
      desired: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'
    },
    js: [
      '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js',
      '//rawgit.com/polomoshnov/jQuery-UI-Resizable-Snap-extension/master/jquery.ui.resizable.snap.ext.v1.9.min.js',
      '//rawgit.com/briangonzalez/jquery.pep.js/master/src/jquery.pep.js'
    ],
    css: [
      '//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css'
    ]
  };

  var cage;
  var cageId = UNIQUE_PREFIX + '-cage';
  var wrapper;
  var wrapperId = UNIQUE_PREFIX + '-wrapper';

  // kind of external resource, filled by gulp tasks
  var injectableTemplates = '<!-- inject:templates -->';
  var injectableStyles = '<!-- inject:styles -->';

  // dom elements
  var elSelectedWord,
    elIframe,
    elIframeTrap;

  // other variables
  var lastTermSearched = '';

  /**
   * Load jQuery
   * @param  {[type]}   url      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  function loadJquery(url, callback) {
    // regex to get only number comman and dots
    // ^[0-9]{1,2}([,.][0-9]{1,2})?$
    // get jquery version
    // jQuery.fn.jquery
    if (typeof window.jQuery == 'undefined') {
      var script = document.createElement('script')
      script.type = 'text/javascript';
      if (script.readyState) { // IE
        script.onreadystatechange = function() {
          if (script.readyState == 'loaded' || script.readyState == 'complete') {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else { // Others
        script.onload = function() {
          callback();
        };
      }
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    } else {
      callback();
    }
  }

  /**
   * Load js files, use jquery
   *
   * @param  {array}   paths     Array of js absolute paths
   * @param  {Function} callback Called when all scripts are loaded
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
   *
   * @param  {array}   paths    Array of css absolute paths
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
   *
   * @param  {array}   paths    Array of css absolute paths
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
   *
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

  /**
   * Get selected text
   *
   * @return {String} The selected text
   */
  function getSelectedText() {
    if (window.getSelection) { // all browsers, except IE before version 9
      var range = window.getSelection();
      return range.toString();
    } else {
      if (document.selection.createRange) { // Internet Explorer
        var range = document.selection.createRange();
        return range.text;
      }
    }
  }

  // Prototype
  myBookmarklet.prototype = {

    initialize: function() {
      var self = this;
      loadJquery(DEPENDENCIES.jquery.desired, function() {
        console.log('jquery loaded');
        self.loadScripts();
      });
    },
    loadScripts: function() {
      var self = this;
      loadStyles(DEPENDENCIES.css);
      loadScripts(DEPENDENCIES.js, function() {
        self.active = false;
        self.run();
      });
    },
    run: function() {
      var self = this;
      // create the dom and make it draggable and resizable
      this.createDom(function() {
        // use jquery ui
        $('#' + wrapperId).draggable({
          // containment: '#' + cageId, // 'document', // '#' + cageId,
          scroll: false,
          // snap: '#' + cageId,
          snapTolerance: 20,
          snapMode: 'inner',
          opacity: 0.8,
          start: function(event, ui) {
            self.coverIframe();
          },
          stop: function(event, ui) {
            self.uncoverIframe();
          }
        })
        // $('#' + wrapperId).pep({
        //   // start: function(e, obj) {
        //   //   if($(e.target).hasClass('ui-resizable-handle')) {
        //   //     obj.options.stop();
        //   //   }
        //   // },
        //   // allowDragEventPropagation: false,
        //   constrainTo: '#' + cageId //'window'
        // })
        .resizable({
          // containment: '#' + cageId,
          maxWidth: 768,
          minWidth: 330,
          handles: 'all',
          // snap: '#' + cageId,
          snapTolerance: 20,
          snapMode: 'inner',
          start: function(event, ui) {
            self.coverIframe();
          },
          stop: function(event, ui) {
            self.uncoverIframe();
          }
        })
        .on('DOMMouseScroll mousewheel', preventScrollBubbling);
        self.active = true;
        // inject custom css
        injectCss(injectableStyles);
        //  bind mouseevents on page
        self.listenSelections();
      });
    },
    coverIframe: function() {
      // elIframeTrap.style.display = 'block';
      // iframe.style.pointerEvents = 'none';
    },
    uncoverIframe: function() {
      // elIframeTrap.style.display = 'none';
      // iframe.style.pointerEvents = 'all';
    },
    createDom: function(callback) {
      // var fragment = document.createDocumentFragment();
      // var div = document.createElement('div');
      // div.innerHTML = injectableTemplates;
      // fragment.appendChild(div);
      // document.body.appendChild(fragment);

      var div = document.createElement('div');
      div.id = wrapperId;
      var iframe = document.createElement('iframe');
      //http://stackoverflow.com/questions/10418644/creating-an-iframe-with-given-html-dynamically
      var iframeId = wrapperId + '-iframe';
      iframe.id = iframeId;
      iframe.name = iframeId;
      iframe.scrolling = 0;
      iframe.frameborder = 0;
      iframe.style.border = 0;
      iframe.src = "data:text/html;charset=utf-8," + escape(injectableTemplates);
      // iframe.contentWindow.document.open();
      // iframe.contentWindow.document.write(injectableTemplates);
      // iframe.contentWindow.document.close();
      div.appendChild(iframe);
      document.body.appendChild(div);

      // find elements
      wrapper = document.getElementById(wrapperId);
      elSelectedWord = wrapper.getElementsByClassName('selected-text')[0];
      elIframe = wrapper.querySelector('#iframe');
      elIframeTrap = wrapper.querySelector('#iframe-overlay-trap');

      callback();
    },
    remove: function() {
      this.active = false;
      cage.parentNode.removeChild(cage);
      wrapper.parentNode.removeChild(wrapper);
    },
    listenSelections: function() {
      var self = this;
      // console.log(wrapper, wrapper.querySelector('#selected-text'))
      // elSelectedWord = wrapper.getElementsByClassName('selected-text')[0];
      document.addEventListener('mouseup', function() {
        var text = getSelectedText();
        if (text && text !== lastTermSearched) {
          elSelectedWord.innerHTML = text;
          self.search(text);
          lastTermSearched = text;
        }
      }, false);
    },
    search: function(query) {
      elIframe.src = 'http://wordreference.com/enit/' + encodeURIComponent(query);
    }
  };

  window.k6Bookmarklet = new myBookmarklet();

})();