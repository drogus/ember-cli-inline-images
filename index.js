'use strict';

var path = require('path');
var fs = require('fs');
var objectAssign = require('object-assign');
var Datauri = require('datauri');
var Path = require('path');
var defaults = require('lodash').defaults;

var Filter = require('broccoli-filter');

function process(str, options) {
  var dataUri, p;
  return str.replace(/inline-image\('?([^'\)]+)'?\)/g, function(match, url) {
    path = Path.join(options.path, url);
    return "url('" + Datauri(path) + "')";
  });
}

function InlineImagerFilter(inputTree, options) {
  if (!(this instanceof InlineImagerFilter)) {
    return new InlineImagerFilter(inputTree, options);
  }

  this.inputTree = inputTree;
  this.options = options || {};
}

InlineImagerFilter.prototype = Object.create(Filter.prototype);
InlineImagerFilter.prototype.constructor = InlineImagerFilter;

InlineImagerFilter.prototype.extensions = ['css'];
InlineImagerFilter.prototype.targetExtension = 'css';

InlineImagerFilter.prototype.processString = function (str, relativePath) {
  var path = Path.join(this.options.root, this.options.imagesPath);
  return process(str, { path: path });
};

function EmberCLIInlineImages(project) {
  this.project = project;
  this.name = 'Ember CLI Inline Images';
}

EmberCLIInlineImages.prototype.postprocessTree = function (type, tree) {
  if ((type === 'all' || type === 'styles') && this.enabled) {
    tree = InlineImagerFilter(tree, this.options);
  }

  return tree;
};

EmberCLIInlineImages.prototype.included = function included(app) {
  this.app = app;
  this.options = defaults(this.app.options.inlineImager || {}, {
    enabled: true,
    imagesPath: 'public/images',
    root: app.project.root
  });
  this.enabled = this.options.enabled;
  delete this.options.enabled;
};

EmberCLIInlineImages.prototype.treeFor = function treeFor() {};

module.exports = EmberCLIInlineImages;
