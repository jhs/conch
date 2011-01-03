// Main Conch application
//

define(

// Requirements
['./conch/models', 'underscore', 'jquery', 'sammy', 'knockout', './jquery.request', 'js/ko.mustacheTemplateEngine']

, function(models, _, $, Sammy, ko) {
  // No jQuery.couch yet.
  //$.couch.urlPrefix = root + '/db';

  var req = $.request.couch;

  var initial = $('#main').html();
  var main = $.sammy('#main', function() {
    this.use(Sammy.Session);

    this.swap = function(content) {
      this.$element().hide().html(content).fadeIn('slow');
    }

    var room = null; // The primary state of the application

    this.get('#/raise', function(ctx) {
      if(!room || !room.me)
        ctx.redirect('#/');

      room.me.state('hand-up');
    }) // get #/raise

    // Routes
    this.get('#/', function(ctx) {
      // Set up the main UI template.
      main.swap('<div data-bind="mustache: \'ddoc/stuff.html\'">Conch loaded. Entering room...</div>');
      req({uri:'ddoc/state.json'}, function(er, resp, body) {
        if(er) throw er;

        room = new models.Room(body);
        room.me = room.member_by_name('Jason');
        if(!room.me) {
          console.log("Need to create myself");
          room.me = new models.Member({name:"Jason"});
          room.join(room.me);
        }
        room.me.is_me(true);

        room.me.buttons.by_name['raise'].onClick = function() {
          var target = room.me.state() === 'hand-up' ? '#/' : '#/raise';
          ctx.redirect(target);
        }

        room.me.buttons.by_name['interrupt'].onClick = function() {
          var target = room.me.state() == 'interrupt' ? '#/' : '#/interrupt';
          ctx.redirect(target);
        }

        ko.applyBindings(room, main.$element().parent().get(0));

        // Debugging.
        window.body = JSON.parse(JSON.stringify(body));
        window.room = room;
        window.main = main;
        window._ = _;
      })
    }) // get #/
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
