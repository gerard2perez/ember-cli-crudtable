import {
    moduleForComponent,
    test
}
from 'ember-qunit';

import Ember from 'ember';

moduleForComponent('crud-table', {
    // specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
});

var ArrField = ['Field1','Field2','Field3'];
var emberdatafix = [
    {
        id:'1',
        Field1:'Data1',
        Field2:'Data2',
        Field3:'Data3'
    },
    {
        id:'2',
        Field1:'Data4',
        Field2:'Data5',
        Field3:'Data6'
    }
];


test('It Renders', function (assert) {
    assert.expect(2);
    var component = this.subject();
    assert.equal(component._state, 'preRender');
    this.render();
    assert.equal(component._state, 'inDOM');
});

test('Can set init variables', function (assert) {
    assert.expect(10);
    var component = this.subject({
        fields:'Field1,Field2,Field3',
        value:emberdatafix,
        stripped:true,
        hover:false
    });
    //component.set('fields', 'Field1,Field2,Field3');
    this.render();

    assert.equal( this.$().attr('class'), 'ember-view');
    //assert.equal( component.get('fields'),ArrField );
    //assert.equal( $('table.table>tbody>tr').count(),2 );
});
