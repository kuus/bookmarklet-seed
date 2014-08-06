(function(window) {

  // useful vars which access parent page, including local jquery
  var windowParent = window.parent
  var documentParent = window.parent.document;
  var $ = windowParent.jQuery;

  console.log('ciao from your bookmarklet app');

})(window);