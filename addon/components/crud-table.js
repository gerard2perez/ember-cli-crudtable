/*globals $*/
import Ember from 'ember';
import layout from '../templates/components/crud-table';

var regenerateView = function (cmp) {
    var model = [];
    var n = -1;
    cmp.value.forEach(function (row) {
        var rrrow = [];
        n++;
        cmp.fields.forEach(function (field) {
            var data = row.get ? row.get(field) : row[field];
            rrrow.push(data);
        });
        //rrrow.id = row.get ? row.get('id') : row['id'];
        rrrow.n = n;
        model.push(rrrow);
    });
    cmp.set('model', model);
};
var showmodal = function () {
            $("#CrudTableDeleteRecordModal").modal('show');
        };

var hidemodal = function (ctx) {
            $("#CrudTableDeleteRecordModal").modal('hide');
            ctx.set('newRecord', false);
            ctx.set('isDeleting', false);
            ctx.set('currentRecord',null);
        };

export default Ember.Component.extend({

    attributeBindings: ['style'],
    style: function () {
        return 'color: ' + this.get('name') + ';';
    }.property('name'),

    stripped: false,
    hover: false,
    createRecord:'',
    updateRecord:'',
    deleteRecord:'',
    currentRecord:null,
    actions: {
        confirm: function () {
            if (this.get('newRecord')) {
                this.sendAction('createRecord');
            } else {
                if (this.get('isDeleting')) {
                    this.sendAction('deleteRecord');
                } else {
                    this.sendAction('updateRecord');
                }
            }
            this.sendAction.apply(this,['delete']);
            hidemodal(this);
        },
        internal_create: function () {
            this.set('newRecord', true);
            showmodal();
        },
        internal_edit: function (record) {
            this.set('isDeleting', false);
            var obj = this.get('value').objectAtContent(record.n);
            this.set('currentRecord',obj);
            $("#CrudTableDeleteRecordModal .modal-title").html("Updating");
            showmodal();
        },
        internal_delete: function (record) {
            this.set('isDeleting', true);
            var obj = this.get('value').objectAtContent(record.n);
            this.set('currentRecord',obj);
            obj = obj.get ? obj.get(this.get('fields')[0]) : obj[this.get('fields')[0]];
            $("#CrudTableDeleteRecordModal .modal-title").html("You're about to delete a record");
            $("#CrudTableDeleteRecordModal .modal-body").html(
                "Deleting the record: <b>" +
                obj +
                "</b> is a permanent action."
            );
            showmodal();
            //this.get('delete')();
        }
    },
    layout: layout,
    class: "",
    value: [],
    fields: "id",
    init: function () {
        var that = this;
        this._super();
        this.set('fields', this.fields.split(','));
        this.set('editdelete', this.deleteRecord != null || this.updateRecord != null);
        this.init = function () {
            that._super();
        }.on('willInsertElement');
    }.on('willInsertElement'),
    setup: function () {
        var that = this;
        regenerateView(that);
        this.fields.forEach(function (field) {
            that.addObserver('value.content.@each.' + field, function () {
                regenerateView(that);
            });
        });
        //$('body').prepend($("#CrudTableDeleteRecordModal"));
        $("#CrudTableDeleteRecordModal").modal('hide');
    }.on('didInsertElement'),
    teardown: function () {
        //this._drop.destroy();
    }.on('willDestroyElement'),
});
