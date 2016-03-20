/* jshint node: true */
'use strict';

module.exports = {
	name: 'ember-cli-crudtable',
	afterInstall () {
		return this.addBowerPackageToProject('bootstrap'); // is a promise
	}
};
