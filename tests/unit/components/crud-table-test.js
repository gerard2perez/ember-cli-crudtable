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
var ArrField = 'Field1,Field2,Field3';
var Generic = DS.Model.extend({
    id: DS.attr('number'),
    Field1: DS.attr('string'),
    Field2: DS.attr('string'),
    Field3: DS.attr('string')
});
var emberdatafix = DS.RecordArray.create({
    content: [
        {
            id: '1',
            Field1: 'Data1',
            Field2: 'Data2',
            Field3: 'Data3'
    },
        {
            id: '2',
            Field1: 'Data4',
            Field2: 'Data5',
            Field3: 'Data6'
    }
]
});
var targetObject = {
    delete: function () {
        component.set('value', DS.RecordArray.create({
            content: [
                {
                    id: '2',
                    Field1: 'Data4',
                    Field2: 'Data5',
                    Field3: 'Data6'
    }
]
        }));
    },
    update: function () {
        ok(true, 'external Action was called!');
    },
    create:function(){
        component.set('value', DS.RecordArray.create({
            content: [
                {
                    id: '1',
                    Field1: 'Data1',
                    Field2: 'Data2',
                    Field3: 'Data3'
                },
                {
                    id: '2',
                    Field1: 'Data4',
                    Field2: 'Data5',
                    Field3: 'Data6'
                },
                {
                    id: '3',
                    Field1: 'Data5',
                    Field2: 'Data6',
                    Field3: 'Data7'
                }
            ]
        }));
    }
};

moduleForComponent('crud-table', {
    // specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
    needs: ['template:crud-table-row', 'template:crud-table-modal'],

    setup: function () {
        App = startApp();
        component = this.subject({
            fields: 'Field1,Field2,Field3',
            value: emberdatafix,
            stripped: true,
            hover: false,
            deleteRecord: 'delete',
            updateRecord: 'update',
            createRecord: 'create'
        });
        component.set('targetObject', targetObject);
    },
    teardown: function () {
        Ember.run(App, 'destroy');
    }

});



test('Can set init variables', function () {
    //assert.expect(4);

    var oldvalue = component.get('value');
    ArrField = ArrField.split(',');

    equal(component.get('fields').length, ArrField.length);
    equal(component.get('fields')[2], ArrField[2]);
    equal(emberdatafix, oldvalue);
    equal(this.$('table.table>tbody>tr').children().length, (ArrField.length + 1) * this.$('table.table>tbody').children().length);
    Ember.run(function () {
        Ember.set(oldvalue.content[0], 'Field1', 'Changed');
        component.set('value', oldvalue);
    });
    equal(this.$('table.table>tbody>tr:eq(0)>td:eq(0)').text(), 'Changed');
});

test('User attemps to delete a Record and cancels', function () {
    var rows = this.$('table.table>tbody>tr').children().length;
    click('[data-action=delete]:eq(0)');
    andThen(function () {
        click('[data-dismiss=modal]');
        andThen(function () {
            equal(find('table.table>tbody>tr').children().length, rows);
        });
    });
});

test('User Create a Record', function () {
    var rows = this.$('table.table>tbody>tr').length;
    click('[data-action=create]');
    andThen(function () {
        equal(find('.modal-title').text().trim(),'Add a New Record');
        click('[data-action=confirm]');
        andThen(function () {
            equal(find('table.table>tbody>tr').length, rows+1);
        });
    });
});

test('User Edits a Record', function () {
    var rows = this.$('table.table>tbody>tr').length;
    click('[data-action=edit]:eq(0)');
    andThen(function () {
        equal(find('.modal-title').text().trim(),'Updating');
        click('[data-action=confirm]');
        andThen(function () {
            equal(find('table.table>tbody>tr').length, rows);
        });
    });
});

test('User delete a Record', function () {
    var rows = this.$('table.table>tbody>tr').length;
    click('[data-action=delete]:eq(0)');
    equal(find('.modal-title').text().trim(),"You're about to delete a record");
    andThen(function () {
        click('[data-action=confirm]');
        andThen(function () {
            equal(find('table.table>tbody>tr').length, rows - 1);
        });
    });
});
