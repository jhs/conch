// Main Conch application
//

define(

// Requirements
['underscore', 'jquery', 'sammy', 'knockout', './jquery.request', 'js/ko.mustacheTemplateEngine']

, function(_, $, Sammy, ko) {
  var ddoc = '/conch/_design/conch';
  var root = '/conch/_design/conch/_rewrite';

  // No jQuery.couch yet.
  //$.couch.urlPrefix = root + '/db';

  var req = $.request.couch;

  // Minor helpers
  function capitalize(str) {
    str = str || "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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

        // An alternating background for the template.
        ;(function() {
          var a = -1
            , classes = ['odd', 'even'];

          room.toggle = function() {
            a += 1;
            if(a >= classes.length)
              a = 0;
            return classes[a];
          }
        })();

        room.members = ko.observableArray(room.members);
        _(room.members()).each(function(member) {
          member.state = ko.observable(member.state || null);
          member.toggle = room.toggle;
          member.human_state = ko.dependentObservable(function() {
            return capitalize(member.state());
          })
        })

        room.members()[0].name = ko.observable(room.members()[0].name);

        room.name = ko.dependentObservable(function() {
          var id = room._id();
          return id.charAt(0).toUpperCase() + id.slice(1);
        })

        room.conch_guy = ko.dependentObservable(function() {
          for(var a = 0; a < this.members().length; a++)
            if(this.members()[a].state() == 'conch')
              return this.members()[a].name();
          return "[Unknown]";
        }, room)

        room.buttons = ko.observableArray([]);
        function add_button(button) {
          _(button).each(function(val, key) {
            if(_.isFunction(val))
              button[key] = ko.dependentObservable(val, room);
            else
              button[key] = ko.observable(val);
          })
          room.buttons().push(button);
        }

        add_button({ label: 'Raise my hand'
                   , type: 'raise'
                   });

        add_button({ label: 'Request interrupt'
                   , type: 'interrupt'
                   });

        room.my_activity =
          { type: ko.dependentObservable(function() {
                    // TODO
                    return 'normal';
                  }, room)
          , label: ko.dependentObservable(function() {
                   return 'I am listening politely.';
                   }, room)
          };

        ko.applyBindings(room, main.$element().parent().get(0));

        // Debugging.
        window.room = room;
        window.main = main;
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
