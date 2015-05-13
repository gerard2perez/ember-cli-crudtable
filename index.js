/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-cli-crudtable',
    included: function(app) {
    	this._super.included(app);
    	app.import(app.bowerDirectory + '/bootstrap/dist/js/bootstrap.js');
    	app.import(app.bowerDirectory + '/bootstrap/dist/css/bootstrap.css.min');
    	app.import(app.bowerDirectory + '/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', { destDir: 'fonts' });
        app.import(app.bowerDirectory + '/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2', { destDir: 'fonts' });
  	}
};
