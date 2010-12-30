// RequireJS wrapper to pull in KnockoutJS
//

define([ 'order!jquery' // Looks like Knockout will use Jquery if it's available.
       , 'order!ddoc/vendor/knockout/knockout-1.1.1.js'
       // knockout.mapping is disabled for now. There is a bug, unsure whether mine or theirs.
       //, 'order!ddoc/vendor/knockout/knockout.mapping-latest.js'
       ], function() {
  // Return the Knockout API as this module.
  return ko;
})
