/*globals $*/
import Ember from 'ember';
import layout from '../templates/components/crud-table';

var CustomField = Ember.Object.extend({
    Field: null,
    Value: null,
    Type: null,
    listener: function () {}.observes('Value')
});

var regenerateView = function (cmp) {
    var ComplexModel = [];
    cmp.value.forEach(function (row) {
        var CustomProperties = [];
        cmp.fields.forEach(function (field) {
            var data = row.get ? row.get(field) : row[field];
            var cfield = CustomField.create({
                Field: field,
                Value: data,
                Type: typeof (data),
                listener: function () {
                    row.set(this.get('Field'), this.get('Value'));
                }.observes('Value')
            });
            CustomProperties.pushObject(cfield);
        });
        CustomProperties.RoutedRecord = row;
        ComplexModel.pushObject(CustomProperties);
    });
    cmp.set('ComplexModel', ComplexModel);
};
var showmodal = function () {
    $("#CrudTableDeleteRecordModal").modal('show');
};

var hidemodal = function () {
    $("#CrudTableDeleteRecordModal").modal('hide');
};

export default Ember.Component.extend({

    attributeBindings: ['style'],
    style: function () {
        return 'color: ' + this.get('name') + ';';
    }.property('name'),
    stripped: false,
    hover: false,
    createRecord: '',
    updateRecord: '',
    deleteRecord: '',
    cancelRecord: 'cancel',
    currentRecord: null,
    getRecord: 'getRecord',
    actions: {
        confirm: function () {
            var that = this;
            var deferred;
            if (this.get('newRecord')) {
                deferred = Ember.RSVP.defer('crud-table#createRecord');
                this.sendAction('createRecord', this.get('currentRecord').RoutedRecord, deferred);
            } else {
                if (this.get('isDeleting')) {
                    deferred = Ember.RSVP.defer('crud-table#deleteRecord');
                    this.sendAction('deleteRecord', this.get('currentRecord').RoutedRecord, deferred);
                } else {
                    deferred = Ember.RSVP.defer('crud-table#updateRecord');
                    this.sendAction('updateRecord', this.get('currentRecord').RoutedRecord, deferred);
                }
            }
            deferred.promise.then(function(){
                regenerateView(that);
                hidemodal();
            },function(data){
                alert(data.message);
            });
        },
        internal_create: function () {
            var that = this;
            that.set('newRecord', true);
            var deferred = Ember.RSVP.defer('crud-table#newRecord');
            this.sendAction('getRecord', deferred);
            deferred.promise.then(function (/*record*/) {
                regenerateView(that);
                that.set('currentRecord', that.get('ComplexModel').get('lastObject'));
                showmodal();
            }, function (/*data*/) {
                alert('Something went wrong');
            });
        },
        internal_edit: function (record) {
            this.set('isDeleting', false);
            this.set('currentRecord', record);
            //$("#CrudTableDeleteRecordModal .modal-title").html("Updating");
            showmodal();
        },
        internal_delete: function (record) {
            this.set('newRecord', false);
            this.set('isDeleting', true);
            this.set('currentRecord', record);
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
        //Ember.addObserver('value',that,function(){
        //    regenerateView(that);
        //});
        $("#CrudTableDeleteRecordModal").modal('hide');
        $('#CrudTableDeleteRecordModal').on('hidden.bs.modal', function () {
            var deferred = Ember.RSVP.defer('crud-table#cancelRecord');
            that.sendAction('cancelRecord', that.get('currentRecord').RoutedRecord, deferred);
            deferred.promise.then(function () {
                regenerateView(that);
                that.set('newRecord', false);
                that.set('isDeleting', false);
                that.set('currentRecord', null);
            },function(data){
                alert(data);
            });

        });

    }.on('didInsertElement'),
    teardown: function () {
        //this._drop.destroy();
    }.on('willDestroyElement'),
});
