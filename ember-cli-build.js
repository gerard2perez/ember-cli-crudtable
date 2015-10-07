/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
	var app = new EmberAddon(defaults);
	app.import('bower_components/bootstrap/dist/js/bootstrap.js');
	app.import('bower_components/bootstrap/dist/css/bootstrap.css');
	return app.toTree();
};