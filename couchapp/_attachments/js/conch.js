// Main Conch application
//

define(['./sammy', 'jquery', './jquery.request'], function() {
  var ddoc = '/conch/_design/conch';
  var root = '/conch/_design/conch/_rewrite';

  // No jQuery.couch yet.
  //$.couch.urlPrefix = root + '/db';

  var req = $.request.couch;

  var initial = $('#main').html();
  var main = $.sammy('#main', function() {
    this.use(Sammy.Session);
    this.use(Sammy.Mustache, "html");

    // implements a 'fade out'/'fade in'
    this.swap = function(content) {
      this.$element().hide().html(content).fadeIn('slow');
    }

    // Routes
    this.get('#/', function(ctx) {
      main.swap('Conch loaded. Entering room...');
      req({uri:'ddoc/state.json'}, function(er, resp, body) {
        if(er) throw er;
        main.swap('Connected: ' + JSON.stringify(body));
      })
    })
  })

  var started = false;
  var start = function() {
    if(started)
      throw new Error("Already started");
    started = true;

    // Seems like wrapping in ready() doesn't hurt anything.
    $(document).ready(function() {
      main.run('#/');
    })
  }

  return { "start":start };
})
