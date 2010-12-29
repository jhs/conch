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
    this.use(Sammy.Mustache, "html");

    // implements a 'fade out'/'fade in'
    this.swap = function(content) {
      this.$element().hide().html(content).fadeIn('slow');
    }

    // Routes
    this.get('#/', function(ctx) {
      //main.swap('Conch loaded. Entering room...');
      req({uri:'ddoc/state.json'}, function(er, resp, room) {
        if(er) throw er;

        /*
        ctx.log("What's happening?");
        var tmpl = 'ddoc/stuff.html';
        false && ctx.load(tmpl, {foo: 23}, function() {
          console.log("Got it once: %o", Array.prototype.slice.apply(arguments));
        });
        //main.swap('Choose: <select data-bind="options: members, optionsText: \'name\'"></select>');

        c=ctx;
        x = room;
        //xr = room = ko.mapping.fromJS(room);
        */
        room._id = ko.observable(room._id);
        room.members = ko.observableArray(room.members);
        ko.applyBindings(room, main.$element().get(0));
        //main.swap('Connected: ' + JSON.stringify(body));
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
