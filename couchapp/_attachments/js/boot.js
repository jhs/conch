// Boot the Conch application
//

require( // Options
         { baseUrl: "ddoc"
         , paths  : { require: "vendor/requirejs/require"
                    , couchdb: "/_utils/script"
                    , jquery : "js/require_jquery"
                    , sammy  : "js/require_sammy"
                    , knockout: "js/require_knockout"
                    }
         }

         // Modules
       , [ 'js/conch' ]

         // Code to run when ready.
       , function(conch) {
           conch.start();
         }
       );
