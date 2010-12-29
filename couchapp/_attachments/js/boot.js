// Boot the Conch application
//

require( // Options
         { baseUrl: "ddoc"
         , paths  : { require: "vendor/requirejs/require"
                    , couchdb: "/_utils/script"
                    , jquery : "/_utils/script/jquery.js?1.4.2" // Use .js extension to include the version query.
                    , sammy  : "vendor/sammy"
                    }
         }

         // Modules
       , [ 'js/conch' ]

         // Code to run when ready.
       , function(conch) {
           conch.start();
         }
       );
