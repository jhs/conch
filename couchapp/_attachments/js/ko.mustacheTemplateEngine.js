define(

// Requirements
['underscore', 'knockout', 'vendor/mustache/requirejs.mustache', 'jquery', 'js/jquery.request', 'sammy']

, function(_, ko, Mustache, jQuery) {

var console = window.console;
if(!console) {
  console = {};
  console.log = console.debug = console.warn = console.error = console.fatal = function() {};
}

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
  var use_once = false;

  var templateName = typeof bindingValue === 'string' ? bindingValue : bindingValue.name || bindingValue.partial;
  if(!templateName && bindingValue.inside) {
    // Use the template from inside the element. This is not very helpful yet because
    // You can't embed a template inside a template because Mustache will simply process the
    // entire file the first time.
    var elem = jQuery(element);

    // The template cache is inappropriate however it's already working so use it.
    // To avoid leaking memory, indicate that the template should be deleted when done.
    use_once = true;
    templateName = Math.random().toString();
    templateCache.set(templateName, {source:elem.html(), use_once:use_once} );
    elem.html('');
  }

  var options = bindingValue.options || {};
  options.templateEngine = new ko.mustacheTemplateEngine(); // Note, this is a new engine for every element udpate.

  function render() {
    var templateData = bindingValue.data || viewModel;
    var partialName = templateName.replace(/^.*\/|\.[^.]*$/g, '');
    var partialContext = templateData[partialName];
    if(bindingValue.partial) {
      // Special treatment for partial templates.
      if(typeof partialContext === 'object')
        // Partial gets its context namespaced from the parent.
        templateData = partialContext;
    }

    if(typeof bindingValue.foreach === 'undefined') {
      // Render the data in one big blob.
      templateData = bindingValue.data || viewModel;
      ko.renderTemplate(templateName, templateData, options, element);
    } else {
      // Render once for each data point.
      // TODO: Check if the use_once templates get purged after the first iteration.
      var items = bindingValue.foreach || [];
      options.afterAdd = bindingValue.afterAdd;
      options.beforeRemove = bindingValue.beforeRemove;
      options.includeDestroyed = bindingValue.includeDestroyed;
      ko.renderTemplateForEach(templateName, items, options, element);
    }

    // Clear the template from the cache if needed.
    if(use_once)
      templateCache.clear(templateName);
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

    // Keeping this in case I need it; still can't figure out how to return any and all possible responses.
    //var wrapped = jQuery('<div class="mustache">' + html + '</div>');

    // The caller needs an array of actual DOM nodes.
    var result = jQuery(html);
    console.debug('Final HTML: %o', result.html());

    return result;
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
    try {
      var evaluator = new Function('with(this) { return (' + script + '); }');
    } catch(e) {
      e.message += '; possibly syntax error in mustache-bound element';
      throw e;
    }

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
