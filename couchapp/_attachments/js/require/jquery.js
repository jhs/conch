// RequireJS wrapper to pull in the custom jQuery from Couch.
//

define([ "/_utils/script/jquery.js?1.4.2" ], function() {
  // Since raw jQuery does not return a module, return it explicitly here.
  return jQuery;
})
