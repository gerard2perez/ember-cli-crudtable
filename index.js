/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-cli-crudtable',
    afterInstall: function () {
        return this.addBowerPackageToProject('bootstrap'); // is a promise
    }
};
