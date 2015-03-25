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
    if (cmp.value) {
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
    }
    cmp.set('ComplexModel', ComplexModel);

};
var showmodal = function () {
    $("#CrudTableDeleteRecordModal").modal('show');
};
var metadata= function(records, that) {
    var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
    var meta = records.get("meta");
    meta = {
        total: meta.count,
        previous: meta.previous,
        current: meta.previous ? (meta.next ?  meta.next - 1:meta.previous+1 ): 1,
        next: meta.next,
        showing: records.get('content.length'),
        name: inflector.pluralize(records.type.typeKey)
    };

    meta.from = (meta.current - 1) * meta.showing + 1;
    meta.to = meta.current * meta.showing;
    meta.links = (function () {
        var arr = [];
        var tpages = Math.ceil(meta.total / meta.showing);
        var stc = meta.current-1;

        var page = 1;
        for(page; page<=stc; page++){
            arr.push({page:page,current:false});
        }
        arr.push({page:page++,current:true});
        for(page; page<=tpages; page++){
            arr.push({page:page,current:false});
        }
        return arr;
    })();

    that.set('pagination', meta);
};
var hidemodal = function () {
    $("#CrudTableDeleteRecordModal").modal('hide');
};
var lastquery={page:null};
export default Ember.Component.extend({

    attributeBindings: ['style'],
    style: function () {
        return 'color: ' + this.get('name') + ';';
    }.property('name'),
    stripped: false,
    hover: false,
    createRecord: 'create',
    updateRecord: 'update',
    deleteRecord: 'delete',
    cancelRecord: 'cancel',
    searchRecord: 'FetchData',
    currentRecord: null,
    getRecord: 'getRecord',
    isLoading: true,
    SearchTerm: "",
    SearchField: "",
    actions: {
        goto:function(page){

            var that = this;
            var deferred = Ember.RSVP.defer('crud-table#goto');
            lastquery.page = page;
            that.set('isLoading', true);
            this.sendAction('searchRecord', lastquery, deferred);
            deferred.promise.then(function (records) {
                metadata(records,that);
                that.set('value', records);
                regenerateView(that);
                that.set('isLoading', false);
            }, function (data) {
                alert(data.message);
                that.set('isLoading', false);
            });
        },
        internal_search: function () {
            var field = $("#SearchField").val();
            var query = {};
            var that = this;
            query[field] = this.get('SearchTerm');
            lastquery = query;
            var deferred = Ember.RSVP.defer('crud-table#createRecord');
            that.set('isLoading', true);
            this.sendAction('searchRecord', query, deferred);
            deferred.promise.then(function (records) {
                metadata(records,that);
                that.set('value', records);
                regenerateView(that);
                that.set('isLoading', false);
            }, function (data) {
                alert(data.message);
                that.set('isLoading', false);
            });
        },
        confirm: function () {
            var that = this;
            var deferred;
            this.set('isLoading',true);
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
            deferred.promise.then(function () {
                regenerateView(that);
                hidemodal();
                that.set('isLoading',false);
            }, function (data) {
                alert(data.message);
                that.set('isLoading',false);
            });
        },
        internal_create: function () {
            var that = this;
            that.set('newRecord', true);
            var deferred = Ember.RSVP.defer('crud-table#newRecord');
            that.sendAction('getRecord', deferred);
            deferred.promise.then(function ( record) {
                that.get('value').pushObject(record);
                regenerateView(that);
                that.set('currentRecord', that.get('ComplexModel').get('lastObject'));
                showmodal();
            }, function ( /*data*/ ) {
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
        var deferred = Ember.RSVP.defer('crud-table#createRecord');
        that.set('isLoading', true);
        this.sendAction('searchRecord', {}, deferred);
        deferred.promise.then(function (records) {
            metadata(records, that);
            that.set('value', records);
            regenerateView(that);
            that.set('isLoading', false);
        }, function (data) {
            alert(data.message);
            that.set('isLoading', false);
        });
        //regenerateView(that);
        //Ember.addObserver('value',that,function(){
        //    regenerateView(that);
        //});
        $("#CrudTableDeleteRecordModal").modal('hide');
        $('#CrudTableDeleteRecordModal').on('hidden.bs.modal', function () {
            var deferred = Ember.RSVP.defer('crud-table#cancelRecord');
            var template = Ember.RSVP.defer('crud-table#RenderTemplate');
            that.sendAction('cancelRecord', that.get('currentRecord').RoutedRecord, deferred);
            deferred.promise.then(function () {
                regenerateView(that);
                that.set('newRecord', false);
                that.set('isDeleting', false);
                that.set('currentRecord', null);
                template.resolve(true);
            }, function (data) {
                alert(data);
            });

        });

    }.on('didInsertElement'),
    teardown: function () {
        //this._drop.destroy();
    }.on('willDestroyElement'),
});
