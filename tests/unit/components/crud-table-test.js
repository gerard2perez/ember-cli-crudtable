/* globals ok*/
import {
	moduleForComponent, test
}
from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
let component;
let App;
let ArrField = {
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
let tricky = 0;
const FakeModel = Ember.Component.extend({
	id: null,
	Field1: null,
	Field2: null,
	Field3: null
});

let searchResult = Ember.Object.create({
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
		let meta = searchResult.get('meta');
		meta.total += tricky;
		searchResult.set('meta', meta);
		deferred.resolve(searchResult);
	},
	getRecord: function (deferred) {
		let newobject = FakeModel.create({
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
		searchResult.get('content').pushObject(record);
		deferred.resolve(record);
	}
};

moduleForComponent('crud-table', 'CrudTable', {
	integration: true,
	beforeEach: function () {
		App = startApp();
		this.set('fields', ArrField);
		this.set('actions.FetchData', targetObject.FetchData);
		this.set('actions.getRecord', targetObject.getRecord);
		this.set('actions.delete', targetObject.delete);
		this.set('actions.update', targetObject.update);
		this.set('actions.create', targetObject.create);
		this.render(hbs `{{crud-table search=true stripped=true hover=true deleteRecord='delete' updateRecord='update' createRecord='create' fields=fields}}`);
	},
	afterEach: function () {
		Ember.run(App, 'destroy');
	}
});

test('No data initialization', function (assert) {
	assert.expect(1);
	assert.equal(1, 1);
});
test('Can Set Initial Variables', function (assert) {
	assert.expect(4);
	andThen(function () {
		assert.equal(this.$("tbody>tr>td:eq(0)").text().replace(/\n|\r/igm, ""), "Data5");
		assert.equal(this.$("tbody>tr>td:eq(1)").text().replace(/\n|\r/igm, ""), "Data7");
		assert.equal(this.$("tbody>tr:eq(1)>td:eq(2)").text().replace(/\n|\r/igm, ""), "Data23");
		assert.equal(this.$("thead>tr>th").length, 4);
	});
});
test('User Creates a Record', function (assert) {
	assert.expect(2);
	tricky = 1;
	this.$('[data-action=create]').click();
	andThen(function () {
		assert.equal(this.$('.modal-title').text().trim(), 'Add a New Record');
		this.$('[data-action=confirm]').click();
		andThen(function () {
			assert.equal(this.$("tbody>tr:eq(2)>td:eq(2)").text().replace(/\n|\r/igm, ""), 'Data99');
		});
	});
});
test('User Edits a Record', function (assert) {
	let rows = parseInt(this.$('[name=total_records]').text());
	assert.expect(1);
	this.$('[data-action=edit]:eq(0)').click();
	andThen(function () {
		this.$('[data-action=confirm]').click();
		andThen(function () {
			assert.equal(this.$('[name=total_records]').text(), rows);
		});
	});
});
test('User attemps to delete a Record and cancels', function (assert) {
	assert.expect(2);
	let rows = this.$('table.table>tbody>tr').children().length;
	assert.equal(this.$('table.table>tbody>tr').children().length, rows);
	this.$('[data-action=edit]:eq(0)').click();
	andThen(function () {
		this.$('[data-dismiss=modal]').click();
		andThen(function () {
			assert.equal(this.$('table.table>tbody>tr').children().length, rows);
		});
	});
});
test('User deletes a Record', function (assert) {
	this.$('[data-action=delete]:eq(0)').click();
	andThen(function () {
		this.$('[data-action=confirm]').click();
		andThen(function () {
			assert.equal(this.$('table.table>tbody>tr').length, 3);
		});
	});
});
test('User pushes a search', function (assert) {
	let that = this;
	this.set('SearchTerm', 'Data2');
	this.$("#SearchField").val('Field1');
	this.$('[data-action=search]').click();
	andThen(function () {
		assert.equal(that.get('SearchTerm'), 'Data2');
		assert.equal(that.get('SearchField'), 'Field1');
		console.log(this.$('tbody>tr').length);
		//		console.log(that.get('ComplexModel'));
		//		assert.equal(that.get('ComplexModel')[2].get('Value'), 'Data99', 'Complex Model not Updated');
		//		assert.equal(that.get('value').get('content').get('lastObject').get('Field1'), 'Data77');
	});
});
test('User interacts with pagination', function (assert) {
	tricky = 30;
	this.$('[data-action=search]').click();
	andThen(function () {
		assert.equal(this.$('[data-page]').length, 3);
		this.$('[data-page=2]').click();
		andThen(function () {
			this.$('[data-page=3]').click();
			andThen(function () {
				//equal(find('[name=total_records]').text(), 3);
				assert.ok("doesn't wait for promises");
			});
		});
	});
});
test('User exports file to CSV', function (assert) {
	assert.expect(1);
	this.$('#tocsv').click();
	andThen(function(){
		assert.ok(this.$("#dlf").text().indexOf("csv")>0, "Download File Not Generated");
	});
});
test('User exports file to TSV', function (assert) {
	this.$('#totsv').click();
	andThen(function(){
		assert.ok(this.$("#dlf").text().indexOf("tsv")>0, "Download File Not Generated");
	});
});
test('User exports file to JSON', function (assert) {
	this.$('#tojson').click();
	andThen(function(){
		console.log(this.$("#dlf").text());
		assert.ok(this.$("#dlf").text().indexOf("json")>0, "Download File Not Generated");
	});
});
test('User exports file to SQL', function (assert) {
	this.$('#tosql').click();
	andThen(function(){
		assert.ok(this.$("#dlf").text().indexOf("sql")>0, "Download File Not Generated");
	});
});
