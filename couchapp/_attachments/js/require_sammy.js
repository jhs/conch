// RequireJS wrapper to pull in the Sammy stuff I need.
//

define([ 'order!jquery'
       , 'order!ddoc/vendor/sammy/sammy-0.6.2-min.js'
       , 'order!ddoc/vendor/sammy/plugins/sammy.json-0.6.2-min.js'
       , 'order!ddoc/vendor/sammy/plugins/sammy.storage-0.6.2-min.js'
       ]
       , function($) {
           // Since raw Sammy does not return a module, return it explicitly here.
           return $.sammy;
         }
      );
