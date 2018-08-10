'use strict';

var path = require('path');
var fs = require('fs');
var objectAssign = require('object-assign');
var Datauri = require('datauri');
var Path = require('path');
var defaults = require('lodash').defaults;

var Filter = require('broccoli-filter');

function process(str, options) {
  var dataUri, p, uri,
      pattern = (options.functionName || 'inline-image') + "\\(['\"]?([^'\"\\)]+)['\"]?\\)",
      regexp  = new RegExp(pattern, 'g');

  return str.replace(regexp, function(match, url) {
    path = Path.join(options.path, url);
    uri = "'" + Datauri(path) + "'";

    if(options.wrapWithUrl) {
      uri = "url(" + uri + ")";
    }

    return uri;
  });
}

function CSSInlineImageFilter(inputTree, options) {
  if (!(this instanceof CSSInlineImageFilter)) {
    return new CSSInlineImageFilter(inputTree, options);
  }

  this.options = options || {};
  Filter.call(this, inputTree);
}

CSSInlineImageFilter.prototype = Object.create(Filter.prototype);
CSSInlineImageFilter.prototype.constructor = CSSInlineImageFilter;

CSSInlineImageFilter.prototype.extensions = ['css'];
CSSInlineImageFilter.prototype.targetExtension = 'css';

CSSInlineImageFilter.prototype.processString = function (str, relativePath) {
  var path = Path.join(this.options.root, this.options.imagesPath);
  return process(str, { path: path, wrapWithUrl: true });
};

function JSInlineImageFilter(inputTree, options) {
  if (!(this instanceof JSInlineImageFilter)) {
    return new JSInlineImageFilter(inputTree, options);
  }

  this.inputTree = inputTree;
  this.options = options || {};
}

JSInlineImageFilter.prototype = Object.create(Filter.prototype);
JSInlineImageFilter.prototype.constructor = JSInlineImageFilter;

JSInlineImageFilter.prototype.extensions = ['js'];
JSInlineImageFilter.prototype.targetExtension = 'js';

JSInlineImageFilter.prototype.processString = function (str, relativePath) {
  var path = Path.join(this.options.root, this.options.imagesPath);
  return process(str, { path: path, functionName: '__inlineImageDataUri__' });
};

function EmberCLIInlineImages(project) {
  this.project = project;
  this.name = 'Ember CLI Inline Images';
}

EmberCLIInlineImages.prototype.included = function included(app) {
  this.app = app;
  var options = defaults(this.app.options.inlineImager || {}, {
    enabled: true,
    imagesPath: 'public/images',
    root: app.project.root
  });

  app.registry.add('css', {
    name: 'ember-cli-inline-images',
    ext: 'css',
    toTree: function(tree) {
      return CSSInlineImageFilter(tree, options);
    }
  });

  app.registry.add('js', {
    name: 'ember-cli-inline-images',
    ext: 'js',
    toTree: function(tree) {
      return JSInlineImageFilter(tree, options);
    }
  });
};

EmberCLIInlineImages.prototype.treeFor = function treeFor() {};

module.exports = EmberCLIInlineImages;
module.exports.CSSInlineImageFilter = CSSInlineImageFilter;
