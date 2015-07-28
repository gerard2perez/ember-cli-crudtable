/* globals equal, ok*/
import {
    moduleForComponent,
    test
}
from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import DS from "ember-data";

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

var emberdatafix = DS.RecordArray.create({
    content: [
        FakeModel.create({
            id: '1',
            Field1: 'Data1',
            Field2: 'Data2',
            Field3: 'Data3'
        }),
        FakeModel.create({
            id: '2',
            Field1: 'Data4',
            Field2: 'Data5',
            Field3: 'Data6'
        })
    ]
});

var searchResult = DS.RecordArray.create({
    type: {
        typeKey: "Dummy"
    },
    meta: {
        count: 2,
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

var targetObject = {
    FetchData: function (query, deferred) {
        var page = query.page ? query.page : 1;
        ok(query);
        searchResult.get('meta').count = searchResult.get('content').length + tricky;
        deferred.resolve(searchResult);
    },
    getRecord: function (deferred) {
        var newobject = FakeModel.create({
            id: '3',
            Field1: 'Data77',
            Field2: 'Data88',
            Field3: 'Data99'
        });
        //searchResult.pushObject(newobject);
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
        deferred.resolve(record);
    }
};

moduleForComponent('crud-table', {
    needs: [
        'component:crud-cell',
        'component:crud-edit-cell',
        'template:ember-cli-crudtable/default/base',
        'template:ember-cli-crudtable/default/top',
        'template:ember-cli-crudtable/default/body',
        'template:ember-cli-crudtable/default/pagination',
        'template:ember-cli-crudtable/table-cell-googlemap',
        'template:ember-cli-crudtable/table-cell-text',
        'template:ember-cli-crudtable/edit-cell-googlemap',
        'template:ember-cli-crudtable/edit-cell-text',
        'template:ember-cli-crudtable/modal-googlemap',
        'template:ember-cli-crudtable/spinner',
        'template:ember-cli-crudtable/table-modal',
        'template:ember-cli-crudtable/table-row',
        'template:ember-cli-crudtable/table-update'
    ],
    setup: function () {
        App = startApp();
        component = this.subject({
            fields: ArrField,
            stripped: true,
            hover: false,
            deleteRecord: null,
            updateRecord: null,
            createRecord: null,
            exports:null
        });
        //component.set('targetObject', targetObject);
        this.render();
    },
    teardown: function () {
        Ember.run(App, 'destroy');
    }
});

test('Actions Are not rendered', function () {
    ok(!!!find('#tocsv').html(),"Shall be empty");
    ok(!!!find('#totsv').html(),"Shall be empty");
    ok(!!!find('#tojson').html(),"Shall be empty");
    ok(!!!find('[data-action=create]').html(),"Shall be empty");
    ok(!!!find('[data-action=edit]').html(),"Shall be empty");
    ok(!!!find('[data-action=delete]').html(),"Shall be empty");
});