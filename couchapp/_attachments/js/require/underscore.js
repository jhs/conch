// RequireJS wrapper for Underscore.js
//

define([ "ddoc/vendor/underscore/underscore.js" ], function() {
  // Since raw jQuery does not return a module, return it explicitly here.
  return window._;
})
