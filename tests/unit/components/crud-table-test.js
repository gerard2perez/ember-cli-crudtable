import { moduleForComponent, test } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
let App;
let ArrField = {
	Field1: {
		Search: true,
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
	renderer: {},
	id: null,
	Field1: null,
	Field2: null,
	Field3: null
});


let searchResult = Ember.Object.create({
	type: {
		typeKey: 'Dummy'
	},
	meta: {
		total: 2,
		previous: null,
		next: 2
	},
	content: Ember.A([
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
	])
});

const targetObject = {
	FetchData: function (query, deferred) {
		let filterResult = Ember.Object.create({
			type: { typeKey: 'Dummy' },
			meta: { total: 2, previous: null, next: 2 },
			content: Ember.A([])
		});
		delete query.page;
		delete query.filterset;
		let dofilter = false;
		searchResult.content.forEach((item,prop) => {
			let keys = Object.keys(query);
			for (const el in keys) {
				dofilter = true;
				if( item[keys[el]] === query[keys[el]]){
					filterResult.content.pushObject(item);
				}
			}
		});
		let meta = searchResult.get('meta');
		meta.total = searchResult.content.length + tricky;
		searchResult.set('meta', meta);
		deferred.resolve(dofilter ? filterResult : searchResult);
	},
	getRecord: function (deferred) {
		let newobject = FakeModel.create({
			id: '3',
			Field1: 'Data77',
			Field2: 'Data88',
			Field3: 'Data99'
		});
		// This will cause to add the record to searchResult beacouse
		// it get bounded to the ember value.
		deferred.resolve(newobject);
	},
	delete: function (record, deferred) {
		delete searchResult.content.removeAt(0);
		deferred.resolve(record);
	},
	update: function (record, deferred) {
		deferred.resolve(record);
	},
	create: function (record, deferred) {
		// searchResult.get('content').pushObject(record);
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
	assert.expect(5);
	assert.equal(this.$('tbody>tr>td:eq(0)').text().replace(/\n|\r/igm, ''), 'Data5');
	assert.equal(this.$('tbody>tr>td:eq(1)').text().replace(/\n|\r/igm, ''), 'Data7');
	assert.equal(this.$('tbody>tr:eq(1)>td:eq(2)').text().replace(/\n|\r/igm, ''), 'Data23');
	assert.equal(this.$('tbody>tr').length, 2);
	assert.equal(this.$('thead>tr>th').length, 4);
});
test('User Creates a Record', function (assert) {
	assert.expect(3);
	// tricky = 1;
	click('[data-action=create]');
	andThen(() => {
		assert.equal(this.$('.modal-title').text().trim(), 'Add a New Record');
		click('[data-action=confirm]');
		andThen(() => {
			assert.equal(this.$('tbody>tr:eq(2)>td:eq(2)').text().replace(/\n|\r/igm, ''), 'Data99');
			assert.equal(this.$('tbody>tr').length, 3);
		});
	});
});
test('User Edits a Record', function (assert) {
	let rows = parseInt(this.$('[name=total_records]').text());
	assert.expect(1);
	click('[data-action=edit]:eq(0)');
	andThen(() => {
		click('#emberclicrudtableconfirm');
		andThen(() => {
			assert.equal(this.$('[name=total_records]').text(), rows);
		});
	});
});
test('User attemps to delete a Record and cancels', function (assert) {
	assert.expect(2);
	let rows = this.$('table.table>tbody>tr').length;
	assert.equal(rows, 3);
	click('[data-action=edit]:eq(0)');
	andThen(() => {
		click('[data-dismiss=modal]');
		andThen(() => {
			assert.equal(this.$('table.table>tbody>tr').length, rows);
		});
	});
});
test('User deletes a Record', function (assert) {
	click('[data-action="delete"]:eq(0)');
	andThen(() => {
		assert.equal(this.$('.modal-title').text().trim(), "You're about to delete a record");
		click('[data-action=confirm]');
		andThen(() => {
			assert.equal(this.$('table.table>tbody>tr').length, 2);
		});
	});
});
test('User pushes a search #1', function (assert) {
	fillIn('#SearchField', 'Field1');
	andThen(()=>{
		fillIn('#SearchTerm', 'Data17');
		andThen(() => {
			click('[data-action=search]');
			andThen(() => {
				assert.equal(this.$('table.table>tbody>tr').length, 1);
			});
		});
	});
});
test('User pushes a search #2', function (assert) {
	fillIn('#SearchField', 'Field1');
	andThen(()=>{
		fillIn('#SearchTerm', 'Data170');
		andThen(() => {
			click('[data-action=search]');
			andThen(() => {
				assert.equal(this.$('table.table>tbody>tr').length, 0);
			});
		});
	});
});
test('User interacts with pagination', function (assert) {
	tricky = 30;
	click('[data-action=search]');
	andThen(() => {
		assert.equal(this.$('[data-page]').length, 4);
		click('[data-page=2]');
		andThen(() => {
			click('[data-page=3]');
			andThen(() => {
				assert.equal(this.$('[name=total_records]').text(), 32);
			});
		});
	});
});
test('User exports file to CSV', function (assert) {
	assert.expect(1);
	this.$('#tocsv').click();
	andThen(() => {
		assert.ok(this.$("#dlf").text().indexOf("csv") > 0, "Download File Not Generated");
	});
});
test('User exports file to TSV', function (assert) {
	click('#totsv');
	andThen(() => {
		assert.ok(this.$("#dlf").text().indexOf("tsv") > 0, "Download File Not Generated");
	});
});
test('User exports file to JSON', function (assert) {
	this.$('#tojson').click();
	andThen(() => {
		assert.ok(this.$("#dlf").text().indexOf("json") > 0, "Download File Not Generated");
	});
});
test('User exports file to SQL', function (assert) {
	this.$('#tosql').click();
	andThen(() => {
		assert.ok(this.$("#dlf").text().indexOf("sql") > 0, "Download File Not Generated");
	});
});
