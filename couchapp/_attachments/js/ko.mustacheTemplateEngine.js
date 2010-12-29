define(['knockout', 'vendor/mustache/requirejs.mustache'], function(ko, Mustache) {

ko.mustacheTemplateEngine = function () {

  function getTemplate(node_id) {
    var node = document.getElementById(node_id);
    if(!node)
      throw new Error("Cannot find template with id: " + node_id);
    return node;
  }

  // Some Javascript blocks are identified at template creation time (createJavaScriptEvaluatorBlock)
  // but must run at render-time.
  var ko_blocks = {};

  this['renderTemplate'] = function (template, data, options) {
    console.log("MUSTACHE renderTemplate:\n%o", {template:template, data:data, options:options});

    // Manually insert the Javascript blocks to be evaluated.
    Object.keys(ko_blocks).forEach(function(id) {
      data[id] = ko_blocks[id];
    })

    //data._id = '<span data-bind="text: _id">x</span>';
    var source = getTemplate(template).text;
    var html = Mustache.to_html(source, data);

    console.log('Final HTML: %o', html);

    // The caller needs an array of actual DOM nodes.
    return jQuery('<div>' + html + '</div>'); // XXX This should not depend on jQuery.
  },

  this['isTemplateRewritten'] = function (template) {
    console.log('isTemplateRewritten: ' + template);
    var result = getTemplate(template).isRewritten === true;
    console.log('Returning: %o', result);
    return result;
  },

  this['rewriteTemplate'] = function (template, rewriterCallback) {
    var templateNode = getTemplate(template);
    var rewritten = rewriterCallback(templateNode.text);
    
    templateNode.text = rewritten;
    templateNode.isRewritten = true;
  },

  this['createJavaScriptEvaluatorBlock'] = function (script) {
    // Mustache will pass the template context (the viewModel, or what Mustache calls the view) as `this`.
    var evaluator = new Function('with(this) { return (' + script + '); }');

    // Use a random template tag to execute the code at render time.
    var id = 'ko_block_' + Math.random().toString();
    ko_blocks[id] = evaluator;
    return '{{{' + id + '}}}';
  }

  /*
  this.addTemplate = function (templateName, templateMarkup) {
    document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "</script>");
  }

  ko.exportProperty(this, 'addTemplate', this.addTemplate);
  */
};

ko.mustacheTemplateEngine.prototype = new ko.templateEngine();

// Use this one by default
ko.setTemplateEngine(new ko.mustacheTemplateEngine());

ko.exportSymbol('ko.mustacheTemplateEngine', ko.mustacheTemplateEngine);


}); // define
