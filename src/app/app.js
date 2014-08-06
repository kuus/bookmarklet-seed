(function(window, document) {

  // useful vars who access parent page
  var windowParent = window.parent
  var documentParent = window.parent.document;
  var $ = windowParent.jQuery;

  // dom elements
  var elIframe;

  // other variables
  var IFRAME_BASE_URL = 'http://wordreference.com/';
  var lastTermSearched = '';

  /**
   * Get selected text
   * @return {String} the selected text
   */
  function getSelectedText() {
    if (windowParent.getSelection) {
      // all browsers, except IE before version 9
      var range = windowParent.getSelection();
      return range.toString();
    } else {
      // Internet Explorer
      if (documentParent.selection.createRange) {
        var range = documentParent.selection.createRange();
        return range.text;
      }
    }
  }

  /**
   * Listen to user text selections on page
   * @return {void}
   */
  function listenSelections() {
    $(documentParent).on('mouseup', function() {
      var text = trim(getSelectedText());
      if (text && text !== lastTermSearched && countWhitespaces(text) <= 2) {
        search(text);
        lastTermSearched = text;
      }
    });
  }

  /**
   * Trime whitespace beginning/end of a string
   * @param  {String} string to trim
   * @return {String} trimmed string
   */
  function trim (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  /**
   * Count number of whitespaces in a string
   * @param  {String} string to analyze
   * @return {Int} number of whitespaces
   */
  function countWhitespaces (str) {
    return str.match(/\S+/g).length;
  }

  /**
   * Search the selected text changing the
   * iframe search query parameter
   * @param  {String} query to look for
   * @return {void}
   */
  function search(query) {
    var lastSrc = elIframe.src;
    var lastSearch = lastSrc.substr(lastSrc.lastIndexOf('/') + 1);
    var language = lastSearch ? lastSrc.substring(lastSrc.lastIndexOf(IFRAME_BASE_URL) + 1, lastSrc.lastIndexOf(lastSearch) - lastSearch.length) : 'enit';
    console.log('http://wordreference.com/' + language + '/' + encodeURIComponent(query))
    // elIframe.src = 'http://wordreference.com/' + language + '/' + encodeURIComponent(query);
  }

  /**
   * Init the sample app
   * @return {void}
   */
  function init() {
    elIframe = document.getElementById('iframe');
    listenSelections();
  }

  init();

})(window, document);