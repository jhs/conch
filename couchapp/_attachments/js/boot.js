// Boot the Conch application
//

require( // Options
         { baseUrl: "ddoc"
         , paths  :
                    // Third-party traditional libraries
                    { require : "vendor/requirejs/require"
                    , mustache: "vendor/mustache/requirejs.mustache"

                    // Convenient way to get scripts from Couch: "futon/sha1", etc.
                    , futon: "/_utils/script"

                    // My RequireJS wrappers around the traditional libraries
                    , jquery    : "js/require/jquery"
                    , sammy     : "js/require/sammy"
                    , knockout  : "js/require/knockout"
                    }
         }

         // Modules
       , [ 'js/conch' ]

         // Code to run when ready.
       , function(conch) {
           conch.start();
         }
       );
