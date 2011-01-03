// Conch models
//
// One day I hope this could be in the ddoc somehow.

define(

['underscore', 'knockout']

, function(_, ko) {
  var ddoc = '/conch/_design/conch';
  var root = '/conch/_design/conch/_rewrite';

  // Minor helpers
  function capitalize(str) {
    str = str || "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function Room(data_model) {
    _.extend(this, JSON.parse(JSON.stringify(data_model)));
    var room = this;

    room._id = ko.observable(room._id);

    var member_objs = room.members || [];
    room.members = ko.observableArray([]);
    _.each(member_objs, function(member_obj, a) {
      var member = new Member(member_obj);
      room.members.push(member);
    })

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

    room.my_activity =
      { type: ko.dependentObservable(function() {
                // TODO
                return 'normal';
              }, room)
      , label: ko.dependentObservable(function() {
               return 'I am listening politely.';
               }, room)
      };

    return room;
  } // Room

  /*
  Room.prototype.join = function(member, opts) {
    opts = opts || {};

    if(!(member instanceof Member))
      member = new Member(member);

    if(opts.me)
      this.me = member;

    if(_.isNumber(opts.replace)) {
      var orig = this.members()[opts.replace];
      this.members.replace(orig, member);
    } else {
      this.members.push(member);
    }
  }
  */

  Room.prototype.member_by_name = function(name) {
    var members = this.members();
    for(var a = 0, l = members.length; a < l; a++)
      if(members[a].name() === name)
        return members[a];
    return null;
  }

  // An alternating background for the templates
  var toggle = (function() {
    var a = -1
      , classes = ['odd', 'even'];

    var real_toggle = function() {
      a += 1;
      if(a >= classes.length)
        a = 0;
      return classes[a];
    }
    return real_toggle;
  })();

  function Member(member, opts) {
    _.extend(this, JSON.parse(JSON.stringify(member)));
    member = this;

    this.name = ko.observable(this.name || null);
    this.state = ko.observable(this.state || null);
    this.toggle = toggle; // For the partial
    this.human_state = ko.dependentObservable(function() {
      return capitalize(this.state());
    }, this)

    this.buttons = ko.observableArray([]);
    this.buttons.by_name = {};
    this.is_me = ko.observable(false);
    var a = 0;
    this.is_me.subscribe(function(val) {
      console.log("I am identifying buttons: " + (++a));
      member.buttons.remove(function() { return true });
      if(val) {
        // Member is me.
        var raise = 
          { name: 'raise'
          , is_enabled: ko.dependentObservable(function() { return member.state() !== 'interrupt' })
          , label: ko.dependentObservable(function() {
                     return member.state() == 'hand-up' ? 'Lower my hand' : 'Raise my hand';
                   })
          }

        var interrupt = 
          { name: 'interrupt'
          , is_enabled: ko.dependentObservable(function() { return member.state() !== 'raise' })
          , label: ko.dependentObservable(function() {
                     return member.state() == 'interrupt' ? 'Cancel interrupt' : 'Request interrupt';
                   })
          }

        member.buttons.push(raise); member.buttons.by_name['raise'] = raise;
        member.buttons.push(interrupt); member.buttons.by_name['interrupt'] = interrupt;
      }
    })
  } // Member

  return {"Room": Room, "Member": Member};
}); // define
