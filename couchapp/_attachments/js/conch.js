(function($) {
  var ddoc = '/conch/_design/conch';
  var root = '/conch/_design/conch/_rewrite';

  // No jQuery.couch yet.
  //$.couch.urlPrefix = root + '/db';

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
      $.request.couch({uri:'ddoc/state.json'}, function(er, resp, body) {
        if(er) throw er;
        main.swap('Connected: ' + JSON.stringify(body));
      })
    })
  })

  // Start when DOM is ready.
  $(function() { main.run('#/') });
})(jQuery);
