/**
 * Bookmarklet skeleton
 *
 * @author kuus <kunderikuus@gmail.com> (http://kunderikuus.net)
 */
(function() {
  console.log('Inside iframe, appjs', window.parent)

  // dom elements
  var elSelectedWord,
    elIframe;

  // other variables
  var lastTermSearched = '';
  var windowParent = window.parent
  var documentParent = window.parent.document;

  /**
   * Get selected text
   *
   * @return {String} The selected text
   */
  function getSelectedText() {
    if (windowParent.getSelection) { // all browsers, except IE before version 9
      var range = windowParent.getSelection();
      return range.toString();
    } else {
      if (documentParent.selection.createRange) { // Internet Explorer
        var range = documentParent.selection.createRange();
        return range.text;
      }
    }
  }

  function listenSelections() {
    documentParent.addEventListener('mouseup', function() {
      var text = trim(getSelectedText());
      if (text && text !== lastTermSearched) {
        if(countWhitespaces(text) > 2) {
          return;
        }
        elSelectedWord.innerHTML = text;
        search(text);
        lastTermSearched = text;
      }
    }, false);
  }

  function trim (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  function countWhitespaces (str) {
    return str.match(/\S+/g).length;
  }

  function search(query) {
    elIframe.src = 'http://wordreference.com/enit/' + encodeURIComponent(query);
  }

  function init() {
    elIframe = document.getElementById('iframe');
    elSelectedWord = document.getElementsByClassName('selected-text')[0];
    listenSelections();
  }

  init();

})();