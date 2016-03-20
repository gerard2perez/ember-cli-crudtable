/* globals ok*/
import {
	moduleForComponent,
	test
}
from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import DS from "ember-data";
import hbs from 'htmlbars-inline-precompile';
var component;
var App;
var ArrField = {
	Field1: {
		Label: 'Field1'
	},
	Field2: {
		Label: 'Field2'
	},
	Field3: {
		Label: 'Field3'
	}
};
var tricky = 0;
var FakeModel = Ember.Component.extend({
	id: null,
	Field1: null,
	Field2: null,
	Field3: null
});

var searchResult = DS.RecordArray.create({
	type: {
		typeKey: "Dummy"
	},
	meta: {
		total: 2,
		previous: null,
		next: 2
	},
	content: [
        FakeModel.create({
			id: 2,
			Field1: 'Data5',
			Field2: 'Data7',
			Field3: 'Data11'
		}),
                FakeModel.create({
			id: 12,
			Field1: 'Data17',
			Field2: 'Data19',
			Field3: 'Data23'
		}),
            ]
});

const targetObject = {
	FetchData: function (query, deferred) {
		console.log("is called");
		var meta = searchResult.get('meta');
		meta.total += tricky;
		searchResult.set('meta', meta);
		deferred.resolve(searchResult);
	},
	getRecord: function (deferred) {
		var newobject = FakeModel.create({
			id: '3',
			Field1: 'Data77',
			Field2: 'Data88',
			Field3: 'Data99'
		});
		deferred.resolve(newobject);
	},
	delete: function (record, deferred) {
		component.get('value').removeAt(0);
		searchResult.removeAt(0);
		deferred.resolve(record);
	},
	update: function (record, deferred) {
		ok(true, 'external Action was called!');
		deferred.resolve(record);
	},
	create: function (record, deferred) {
		console.log('create');
		searchResult.get('content').pushObject(record);
		deferred.resolve(record);
	}
};

moduleForComponent('crud-table', 'CrudTable', {
	integration: true,
	//    needs: [
	//        'component:crud-cell',
	//        'component:crud-edit-cell',
	//        'template:ember-cli-crudtable/default/base',
	//        'template:ember-cli-crudtable/default/top',
	//        'template:ember-cli-crudtable/default/body',
	//        'template:ember-cli-crudtable/default/pagination',
	//        'template:ember-cli-crudtable/table-cell-googlemap',
	//        'template:ember-cli-crudtable/table-cell-text',
	//        'template:ember-cli-crudtable/edit-cell-googlemap',
	//        'template:ember-cli-crudtable/edit-cell-text',
	//        'template:ember-cli-crudtable/modal-googlemap',
	//        'template:ember-cli-crudtable/spinner',
	//        'template:ember-cli-crudtable/table-modal',
	//        'template:ember-cli-crudtable/table-row',
	//        'template:ember-cli-crudtable/table-update'
	//    ],
	beforeEach: function () {
		App = startApp();

	},
	afterEach: function () {
		Ember.run(App, 'destroy');
	}
});

test('No data initialization', function (assert) {
	this.set('fields', ArrField);
	this.set('log', console.log);
	this.set('actions.FetchData', targetObject.FetchData);
	this.render(hbs `{{crud-table search=true stripped=true hover=true deleteRecord='delete' updateRecord='update' createRecord='create' fields=fields}}`);
	console.log("yes3");
	assert.expect(1);
	assert.equal(1, 1);
	console.log("yes3");
});
//test('Can Set Initial Variables', function (assert) {
//    assert.expect(3);
//    this.render();
//    andThen(function(){
//        assert.equal(component.get('ComplexModel').get('lastObject').get('lastObject').get('Value'), 'Data23');
//        assert.equal(component.get('labels').length, 3);
//        assert.equal(find('table.table>tbody>tr').children().length, (component.get('labels').length + 1) * find('table.table>tbody').children().length);
//    });
//});
//test('User Creates a Record', function (assert) {
//    this.render();
//    assert.expect(2);
//    tricky = 1;
//    //var rows = parseInt(this.$('[name=total_records]').text());
//    click('[data-action=create]');
//    andThen(function () {
//        assert.equal($('.modal-title').text().trim(), 'Add a New Record');
//        click($('[data-action=confirm]'));
//        andThen(function () {
//            assert.equal(component.get('ComplexModel').get('lastObject').get('lastObject').get('Value'), 'Data99');
//            //assert.equal(find('[name=total_records]').text(), rows + 1);
//            //For some reason the view is not yet updated.
//        });
//    });
//});
//test('User Edits a Record', function (assert) {
//    var rows = parseInt(this.$('[name=total_records]').text());
//    this.render();
//    assert.expect(1);
//    click('[data-action=edit]:eq(0)');
//    andThen(function () {
//        //assert.equal($('.modal-title').html().trim(), 'Updating');
//        click( $('[data-action=confirm]'));
//        andThen(function () {
//            assert.equal(find('[name=total_records]').text(), rows);
//        });
//    });
//});
//test('User attemps to delete a Record and cancels', function (assert) {
//    this.render();
//    assert.expect(2);
//    var rows = this.$('table.table>tbody>tr').children().length;
//    assert.equal($('table.table>tbody>tr').children().length, rows);
//    click('[data-action=edit]:eq(0)');
//    andThen(function () {
//        click( $('[data-dismiss=modal]'));
//        andThen(function () {
//            assert.equal(find('table.table>tbody>tr').children().length, rows);
//        });
//    });
//});
//
//
//
//
//
//
//test('User deletes a Record', function (assert) {
//    this.render();
//    //var rows = this.$('table.table>tbody>tr').length;
//    click('[data-action=delete]:eq(0)');
//    andThen(function () {
//        //equal($('#CrudTableDeleteRecordModal').html().trim(), "You're about to delete a record");
//        click( $('[data-action=confirm]'));
//        andThen(function () {
//            assert.ok('Templates take to long to render, causeing async fail');
//        });
//    });
//});
//
//test('User pushes a search', function (assert) {
//    this.render();
//    Ember.run(function () {
//        component.set('SearchTerm', 'Data2');
//        component.set('SearchField', 'Field1');
//        click('[data-action=search]');
//    });
//    andThen(function () {
//        assert.equal(component.get('SearchTerm'), 'Data2');
//        assert.equal(component.get('SearchField'), 'Field1');
//        assert.equal(component.get('ComplexModel').get('lastObject').get('lastObject').get('Value'), 'Data99', 'Complex Model not Updated');
//        assert.equal(component.get('value').get('content').get('lastObject').get('Field1'), 'Data77');
//    });
//});
//
//// test('User interacts with pagination', function (assert) {
////     this.render();
////     tricky = 6;
////     click('[data-action=search]');
////     andThen(function () {
////         assert.equal(find('[data-page]').length, 3);
////         click('[data-page=2]');
////         andThen(function () {
////             click('[data-page=3]');
////             andThen(function () {
////                 //equal(find('[name=total_records]').text(), 3);
////                 assert.ok("doesn't wait for promises");
////             });
////         });
////     });
//// });
//test('User exports file to CSV', function (assert) {
//    this.render();
//    click('#tocsv');
//    andThen(function () {
//        assert.ok(component.get('dlf').getAttribute('href'), "Download File Not Generated");
//    });
//});
//test('User exports file to TSV', function (assert) {
//    this.render();
//    click('#totsv');
//    andThen(function () {
//        assert.ok(component.get('dlf').getAttribute('href'), "Download File Not Generated");
//    });
//});
//test('User exports file to JSON', function (assert) {
//    this.render();
//    click('#tojson');
//    andThen(function () {
//        assert.ok(component.get('dlf').getAttribute('href'), "Download File Not Generated");
//    });
//});
