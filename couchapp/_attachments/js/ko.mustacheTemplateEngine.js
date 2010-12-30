define(

// Requirements
['underscore', 'knockout', 'vendor/mustache/requirejs.mustache', 'jquery', 'js/jquery.request', 'sammy']

, function(_, ko, Mustache, jQuery) {

// TODO: Track templates that are in-flight so if another template request comes along, don't re-request
// it or anything. Just hook into some kind of event when it becomes available.
var storageTypes = ['local', 'session', 'data', 'memory'];
storageTypes = ['data', 'memory']; // XXX development
var templateCache = new Sammy.Store({name:'mustacheCache', type:storageTypes});

//
// Mustache binding instead of old and busted "template" binding.
//

ko.bindingHandlers.mustache = {};

ko.bindingHandlers.mustache.init = function(element, valueAccessor, allBindingsAccessor, viewModel) {
  // This will be called when the binding is first applied to an element
  // Set up any initial state, event handlers, etc. here

  // TODO: Maybe start fetching the template here?
}

ko.bindingHandlers.mustache.update = function(element, valueAccessor, allBindingsAccessor, viewModel) {
  // This will be called once when the binding is first applied to an element,
  // and again whenever the associated observable changes value.
  // Update the DOM element based on the supplied values here.
  var bindingValue = ko.utils.unwrapObservable(valueAccessor());
  var templateData = bindingValue.data || viewModel;

  var templateName = typeof bindingValue === 'string' ? bindingValue : bindingValue.name;
  if(!templateName && bindingValue.inside) {
    // Use the template from inside the element. This is not very helpful yet because
    // You can't embed a template inside a template because Mustache will simply process the
    // entire file the first time.
    var elem = jQuery(element);

    // The template cache is inappropriate however it's already working so use it.
    // To avoid leaking memory, indicate that the template should be deleted when done.
    templateName = Math.random().toString();
    templateCache.set(templateName, {source:elem.html(), use_once:true} );
    elem.html('');
  }

  var options = bindingValue.options || {};
  options.templateEngine = new ko.mustacheTemplateEngine(); // Note, this is a new engine for every element udpate.

  function render() {
    // No foreach support yet.
    ko.renderTemplate(templateName, templateData, options, element);
  }

  if(templateCache.exists(templateName)) {
    render();
  } else {
    jQuery.request({uri:templateName}, function(er, resp, body) {
      if(er) throw er;
      if(resp.status >= 400)
        throw new Error("No template found from server '" + templateName + "': " + resp.status + ' ' + body);
      if(body.length == 0)
        throw new Error("No template found from server: " + templateName);

      // Store it and start the process.
      templateCache.set(templateName, {source:body});
      render();
    })
  }
}

//
// Mustache template engine
//

ko.mustacheTemplateEngine = function () {

  function getTemplate(node_id) {
    var data = templateCache.get(node_id);
    if(!data)
      throw new Error("Cannot find template with id: " + node_id);
    return data;
  }

  // Some Javascript blocks are identified at template creation time (createJavaScriptEvaluatorBlock)
  // but must run at render-time.
  var ko_blocks = {};

  this['renderTemplate'] = function (template_id, data, options) {
    //console.log("MUSTACHE renderTemplate:\n%o", {template_id:template_id, data:data, options:options});

    // Manually insert the Javascript blocks to be evaluated.
    _(ko_blocks).each(function(code, tag_id) {
      data[tag_id] = code;
    })

    var template = getTemplate(template_id);
    var html = Mustache.to_html(template.source, data);

    console.debug('Final HTML: %o', html);

    if(template.use_once)
      templateCache.clear(template_id);

    // The caller needs an array of actual DOM nodes.
    return jQuery('<div>' + html + '</div>');
  },

  this['isTemplateRewritten'] = function (template) {
    console.log('isTemplateRewritten: ' + template);
    var result = getTemplate(template).isRewritten === true;
    console.log('Returning: %o', result);
    return result;
  },

  this['rewriteTemplate'] = function (id, rewriterCallback) {
    var template = getTemplate(id);
    template.source = rewriterCallback(template.source);
    template.isRewritten = true;

    templateCache.set(id, template);
  },

  this['createJavaScriptEvaluatorBlock'] = function (script) {
    // Mustache will pass the template context (the viewModel, or what Mustache calls the view) as `this`.
    var evaluator = new Function('with(this) { return (' + script + '); }');

    // Use a random template tag to execute the code at render time.
    var id = 'ko_block_' + Math.random().toString();
    ko_blocks[id] = evaluator;
    return '{{{' + id + '}}}';
  }

}; // ko.mustacheTemplateEngine

ko.mustacheTemplateEngine.prototype = new ko.templateEngine();

// Use this one by default
//ko.setTemplateEngine(new ko.mustacheTemplateEngine());

ko.exportSymbol('ko.mustacheTemplateEngine', ko.mustacheTemplateEngine);
}); // define
