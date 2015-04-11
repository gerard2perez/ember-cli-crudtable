/*globals $, google*/
import Ember from 'ember';
import layout from '../templates/components/crud-table';

var CustomField = Ember.Object.extend({
    Field: null,
    Value: null,
    Type: null,
    Display: null,
    DisplayField: null,
    listener: function () {}.observes('Value'),
    googlefield: function () {}.observes('Display'),
});
var recalculatePagination = function (that, meta) {
    var arr = [];
    var tpages = Math.ceil(meta.total / meta.showing);
    var neightboor = 3;
    var slots = 1;
    var max = neightboor * 2 + slots * 2 + 3;
    var de1 = slots;
    var de2 = meta.current - neightboor;
    var df2 = tpages - slots + 1;
    var df1 = meta.current + neightboor;
    var compress = tpages > max;
    var preadd = true;
    var postadd = true;
    for (var i = 1; i <= tpages; i++) {
        if (compress) {
            var TP = max - ((tpages - meta.current) + neightboor + 1 + slots + 1);
            var TP2 = max - (meta.current + neightboor + 1 + slots);
            if ((de1 < i && i < de2) && i < de2 - TP) {
                if (preadd) {
                    preadd = false;
                    arr.push({
                        page: "..",
                        current: false
                    });
                }
            } else if ((df1 < i && i < df2) && i > df1 + TP2) {
                if (postadd) {
                    postadd = false;
                    arr.push({
                        page: "..",
                        current: false
                    });
                }
            } else {
                arr.push({
                    page: i,
                    current: meta.current === i
                });
            }

        } else {
            arr.push({
                page: i,
                current: meta.current === i
            });
        }
    }

    meta.links = arr;
    that.set('pagination', meta);
};
var regenerateView = function (cmp) {
    var ComplexModel = [];
    if (cmp.value) {
        cmp.value.forEach(function (row) {
                var CustomProperties = [];
                Object.keys(cmp.fields).forEach(function (field) {
                        var data = row.get(field);
                        var cfield = CustomField.create({
                            Field: field,
                            Value: data,
                            Display: data,
                            Type: cmp.fields[field].Type || 'text',
                            listener: function () {
                                row.set(this.get('Field'), this.get('Value'));
                                if (cmp.fields[field].Display == null) {
                                    row.set('Display', this.get('Value'));
                                }
                            }.observes('Value'),
                            googlefield: function () {
                                if (this.get('DisplayField')) {
                                    row.set(this.get('DisplayField'), this.get('Display'));
                                }
                            }.observes('Display')
                        });
                        switch (cfield.get('Type')) {
                        case 'googlemap':
                            if (cmp.fields[field].Display != null) {
                                cfield.set('Zoom', {
                                    value: row.get(cmp.fields[field].Zoom),
                                    field: cmp.fields[field].Zoom
                                });
                            cfield.set('Display', row.get(cmp.fields[field].Display));
                            cfield.set('DisplayField', cmp.fields[field].Display);
                        }
                        break;
                    }
                    CustomProperties.pushObject(cfield);
                }); CustomProperties.RoutedRecord = row; ComplexModel.pushObject(CustomProperties);
        });
}
cmp.set('ComplexModel', ComplexModel);

};
var showmodal = function () {
    $("#CrudTableDeleteRecordModal").modal('show');
};
var metadata = function (records, that) {
    var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
    var meta = records.get("meta");
    meta = {
        total: meta.count,
        previous: meta.previous,
        current: meta.previous ? (meta.next ? meta.next - 1 : meta.previous + 1) : 1,
        next: meta.next,
        showing: that.page_size,
        name: inflector.pluralize(records.type.typeKey)
    };
    meta.from = (meta.current - 1) * meta.showing + 1;
    meta.to = meta.current * meta.showing;
    meta.to = meta.to > meta.total ? meta.total : meta.to;
    recalculatePagination(that, meta);

};
var hidemodal = function () {
    $("#CrudTableDeleteRecordModal").modal('hide');
};
var lastquery = {
    page: null
};


export default Ember.Component.extend({
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
    value: [],
    layout: layout,
    class: "",
    fields: "id",
    labels: [],
    actions: {
        toJSONObject: function () {
            var data = [];
            this.get('ComplexModel').forEach(function (model) {
                var row = {};
                model.forEach(function (field) {
                    row[field.Field] = field.Value;
                });
                data.push(row);
            });
            var csvContent = "data:text/json;charset=utf-8," + JSON.stringify(data);
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "table.json");
            this.set('dlf', link);
            link.click();
        },
        toTSV: function () {

            var data = [];
            var row = [];
            this.labels.forEach(function (field) {
                row.push(field);
            });
            data.push(row);

            this.get('ComplexModel').forEach(function (model) {
                row = [];
                model.forEach(function (field) {
                    row.push(field.Value);
                });
                data.push(row);
            });
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function (infoArray, index) {
                var dataString = infoArray.join("\t");
                csvContent += index < data.length ? dataString + "\n" : dataString;
            });
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "table.tsv");
            this.set('dlf', link);
            link.click();
        },
        toCSV: function () {

            var data = [];
            var row = [];
            this.labels.forEach(function (field) {
                row.push(field);
            });
            data.push(row);

            this.get('ComplexModel').forEach(function (model) {
                row = [];
                model.forEach(function (field) {
                    row.push(field.Value);
                });
                data.push(row);
            });
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function (infoArray, index) {
                var dataString = infoArray.join(",");
                csvContent += index < data.length ? dataString + "\n" : dataString;
            });
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "table.csv");
            this.set('dlf', link);
            link.click();
        },
        goto: function (page) {
            var that = this;
            var deferred = Ember.RSVP.defer('crud-table#goto');
            lastquery.page = page;
            that.set('isLoading', true);
            this.sendAction('searchRecord', lastquery, deferred);
            deferred.promise.then(function (records) {
                metadata(records, that);
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
                metadata(records, that);
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
            this.set('isLoading', true);
            if (this.get('newRecord')) {
                deferred = Ember.RSVP.defer('crud-table#createRecord');
                this.sendAction('createRecord', this.get('currentRecord').RoutedRecord, deferred);
            } else if (this.get('showMap')) {
                var record = this.get('currentRecord');
                var map;
                var RoutedPropMap;
                record.forEach(function (prop) {
                    RoutedPropMap = prop;
                    if (prop.Type === 'googlemap') {
                        map = record.get('map').getCenter();
                        prop.set('Value', map.toUrlValue());
                    }
                });
                deferred = Ember.RSVP.defer('crud-table#updateRecord');
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': map
                }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            var add = results[0].formatted_address;
                            var use = prompt('Suggested address is:\n' + add + '\n If you want to use it leave the field empty.');
                            if (use === null || use === "") {
                                record.RoutedRecord.set(RoutedPropMap.DisplayField, add);
                            } else {
                                record.RoutedRecord.set(RoutedPropMap.DisplayField, use);
                            }

                            record.RoutedRecord.set(RoutedPropMap.Zoom.field, record.get('map').getZoom());
                            /*var value = add.split(",");
                            var count = value.length;
                            var country = value[count - 1];
                            var state = value[count - 2];
                            var city = value[count - 3];
                            alert("city name is: " + city);*/
                        } else {
                            alert("address not found");
                        }
                    } else {
                        alert("Geocoder failed due to: " + status);
                    }
                    that.sendAction('updateRecord', record.RoutedRecord, deferred);
                });
            } else {
                if (this.get('isDeleting')) {
                    deferred = Ember.RSVP.defer('crud-table#deleteRecord');
                    this.sendAction('deleteRecord', this.get('currentRecord').RoutedRecord, deferred);
                } else {
                    deferred = Ember.RSVP.defer('crud-table#updateRecord');
                    this.sendAction('updateRecord', this.get('currentRecord').RoutedRecord, deferred);
                }
            }

            var updateview = Ember.RSVP.defer('crud-table#pagination');
            deferred.promise.then(function () {
                lastquery.page = that.get('pagination').current;
                that.sendAction('searchRecord', lastquery, updateview);
                //regenerateView(that);
                //recalculatePagination(that,that.get('pagination'));
            }, function (data) {
                alert(data.message);
                that.set('isLoading', false);
            });

            updateview.promise.then(function (records) {
                metadata(records, that);
                that.set('value', records);
                regenerateView(that);
                hidemodal();
                that.set('isLoading', false);
            }, function (data) {
                alert(data.message);
                that.set('isLoading', false);
            });
        },
        internal_map: function (record) {
            var that = this;
            that.set('showMap', true);
            this.set('currentRecord', record);
            showmodal();
            function mapit(id, latlng) {
                var mapOptions = {
                    zoom: latlng.zoom,
                    center: new google.maps.LatLng(latlng.lat, latlng.lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(document.getElementById(id), mapOptions);
                record.set('map', map);
            }

            var cord = "";
            record.forEach(function (prop) {
                if (prop.Type === 'googlemap') {
                    cord = prop.Value.split(',');
                    cord = {
                        lat: cord[0],
                        lng: cord[1],
                        zoom: prop.Zoom.value
                    };
                }
            });

            setTimeout(function () {
                mapit('google_map_canvas', cord);
            }, 500);
        },
        internal_create: function () {
            var that = this;
            that.set('newRecord', true);
            var deferred = Ember.RSVP.defer('crud-table#newRecord');
            that.sendAction('getRecord', deferred);
            deferred.promise.then(function (record) {
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
    init: function () {
        var that = this;
        this._super();
        that.set('labels', []);
        Object.keys(this.get('fields')).forEach(function (key) {
            that.get('labels').push(that.fields[key].Label);
        });
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

        $(this).addClass(this.get('class'));

        deferred.promise.then(function (records) {
            that.page_size = records.get('content.length');
            metadata(records, that);
            that.set('value', records);
            regenerateView(that);
            that.set('isLoading', false);
        }, function (data) {
            alert(data.message);
            that.set('isLoading', false);
        });
        $("#CrudTableDeleteRecordModal").modal('hide');
        $('#CrudTableDeleteRecordModal').on('hidden.bs.modal', function () {
            var deferred = Ember.RSVP.defer('crud-table#cancelRecord');
            var template = Ember.RSVP.defer('crud-table#RenderTemplate');
            that.sendAction('cancelRecord', that.get('currentRecord').RoutedRecord, deferred);
            deferred.promise.then(function (args) {
                if (args.remove) {
                    that.get('value').removeObject(args.record);
                }
                regenerateView(that);
                that.set('newRecord', false);
                that.set('isDeleting', false);
                that.set('currentRecord', null);
                that.set('showMap', false);
                template.resolve(true);
            }, function (data) {
                alert(data);
            });

        });

    }.on('didInsertElement'),
    teardown: function () {

    }.on('willDestroyElement'),
});
