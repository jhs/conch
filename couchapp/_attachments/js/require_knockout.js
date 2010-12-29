// RequireJS wrapper to pull in KnockoutJS
//

define([ 'order!ddoc/vendor/knockout/knockout-1.1.1.js'
       , 'order!ddoc/vendor/knockout/knockout.mapping-latest.js'
       ], function() {
  // Return the Knockout API as this module.
  return ko;
})
