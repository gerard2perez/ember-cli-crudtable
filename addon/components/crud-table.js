import Ember from 'ember';
import layout from '../templates/components/crud-table';

export default Ember.Component.extend({

    stripped:false,
    hover:false,

    actions:{
        edit:function(){
            this.get('edit')();
        },
        delete:function(){
            this.get('delete')();
        }
    },
    layout: layout,
    class: "",
    value: [],
    fields: "id",
    edit: function () {
        alert('edit');
    },
    delete: function () {
        alert('delete');
    },
    init: function () {
        var that = this;
        this._super();
        this.set('fields', this.fields.split(','));
        this.set('editdelete', this.edit != null || this.delete !=null  );
        this.init = function () {
            that._super();
        }.on('willInsertElement');
    }.on('willInsertElement'),
    setup: function () {
        var that = this;
        var model = [];
        this.value.forEach(function (row) {
            var rrrow = [];
            that.fields.forEach(function (field) {
                rrrow.push(row.get(field));
            });
            model.push(rrrow);
        });
        this.set('model', model);
    }.on('didInsertElement'),

    teardown: function () {
        //this._drop.destroy();
    }.on('willDestroyElement'),
});
