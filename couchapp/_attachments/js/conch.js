// Main Conch application
//

define(['jquery', 'sammy', 'knockout', './jquery.request', 'js/ko.mustacheTemplateEngine'], function($, Sammy, ko) {
  var ddoc = '/conch/_design/conch';
  var root = '/conch/_design/conch/_rewrite';

  // No jQuery.couch yet.
  //$.couch.urlPrefix = root + '/db';

  var req = $.request.couch;

  var initial = $('#main').html();
  var main = $.sammy('#main', function() {
    this.use(Sammy.Session);

    this.swap = function(content) {
      this.$element().hide().html(content).fadeIn('slow');
    }

    // Routes
    this.get('#/', function(ctx) {
      // Set up the main UI template.
      main.swap('<div data-bind="mustache: \'ddoc/stuff.html\'">Conch loaded. Entering room...</div>');
      req({uri:'ddoc/state.json'}, function(er, resp, room) {
        if(er) throw er;

        room._id = ko.observable(room._id);
        room.members = ko.observableArray(room.members);
        ko.applyBindings(room, main.$element().get(0));

        window.room = room; // debugging
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
