/*globals $, google*/
import Ember from 'ember';
import DF from '../utils/dateformat';

var modalpromise;
var proccesDef = [];
var PreLoad = [];
var lastquery = {
    page: 1
};
var PromiseHandler;
var PULLID = 0;
var CustomField = Ember.Object.extend({
    Format: null,
    Field: null,
    Value: null,
    Type: null,
    Display: null,
    Label: null,
    Create:null,
    Edit:null,
    DisplayField: null,
    List: null,
    Suffix: null,
    Prefix: null,
    OnChoose:null,
    listener: function() {}.observes('Value'),
    googlefield: function() {}.observes('Display'),
});
var recalculatePagination = function(that, meta) {
    if(meta.showing===0){meta.showing=1;}
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
var checkvals = function(cmp, records, cfield, field) {

    if(cmp.fields[field].Source === undefined){
        cfield.set('Display',  records.get(cmp.fields[field].Display) );
    }else{
        var datafinal = [];
        var deps = cmp.get('dependants')[cmp.fields[field].Source];
        deps.forEach(function(datadep) {
            var info = {
                Display: datadep.get(cmp.fields[field].Display),
                Routed: datadep,
                Added: false
            };
            if (records.some !== undefined) {
                records.some(function(record) {
                    info.Added = datadep.get('id') === record.get('id');
                    if (info.Added) {
                        return true;
                    }
                });
            }else{
                info.Added = datadep.get('id') === records.get('id');
            }
            datafinal.push(info);
        });
        cfield.set('Display', datafinal);
    }
};
var regenerateView = function(cmp) {
    var ComplexModel = [];
    if (cmp.value) {
        cmp.value.forEach(function(row) {
            var CustomProperties = [];
            Object.keys(cmp.fields).forEach(function(field) {
                var data = row.get(field);
                var cfield = CustomField.create({
                    Field: field,
                    Value: data,
                    Choose: cmp.fields[field].OnChoose,
                    Display: DF.format(data, cmp.fields[field].Format),
                    List: cmp.fields[field].List === false ? true:false,
                    Suffix: cmp.fields[field].Suffix,
                    Prefix: cmp.fields[field].Prefix,
                    Label: cmp.fields[field].Label,
                    Edit: cmp.fields[field].Edit || cmp.fields[field].ReadOnly || false,
                    Create: cmp.fields[field].Create || false,
                    Type: cmp.fields[field].Type || 'text',
                    listener: function() {
                        row.set(this.get('Field'), this.get('Value'));
                        if (cmp.fields[field].Display === null) {
                            row.set('Display', this.get('Value'));
                        }
                    }.observes('Value'),
                    googlefield: function() {
                        if (this.get('DisplayField')) {
                            row.set(this.get('DisplayField'), this.get('Display'));
                        }
                        this.set('Edit', cmp.fields[field].Edit || this.get('Type') === "googlemap");
                    }.observes('Display')
                });
                var Type = cfield.get('Type');
                var inherits = Type.split(':');
                if(inherits.length === 2){
                    Type = inherits[1];
                    cfield.set('Type',inherits[0]);
                }
                switch (Type) {
                    case 'check':
                        if (cmp.fields[field].Value) {
                            cfield.set('Display', 'checked="checked"');
                        }
                        break;
                    case 'many-multi':
                    case 'belongsto':
                        if (data.isLoaded) {
                            checkvals(cmp, data, cfield, field);
                        } else {
                            data.then(
                                function() {
                                    checkvals(cmp, data, cfield, field);
                                },
                                function(e) {
                                    console.log(e);
                                }
                            );
                        }
                        break;
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
                CustomProperties[field] = cfield;
                CustomProperties.pushObject(cfield);
            });
            CustomProperties.RoutedRecord = row;
            ComplexModel.pushObject(CustomProperties);
        });
    }
    cmp.set('ComplexModel', ComplexModel);
};
var showmodal = function() {
    modalpromise = Ember.RSVP.defer('crud-table#showingmodal');
    var modal = $("#CrudTableDeleteRecordModal");
    console.log($.fn.modal);
    modal.modal('show');
};
var metadata = function(records, that) {
    var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
    var meta = records.get("meta");
    meta = {
        total: meta.count,
        previous: meta.previous,
        current: meta.previous ? (meta.next ? meta.next - 1 : meta.previous + 1) : 1,
        next: meta.next,
        showing: that.get('page_size') === 0 ? 1:that.get('page_size'),
        name: inflector.pluralize(records.type.modelName)
    };
    meta.from = (meta.current - 1) * meta.showing + 1;
    meta.to = meta.current * meta.showing;
    meta.to = meta.to > meta.total ? meta.total : meta.to;
    recalculatePagination(that, meta);

};
var hidemodal = function() {
    try{
        $("#CrudTableDeleteRecordModal").modal('hide');
    }catch(e){
        console.log("Fix This");
    }
    
};
var PULLFN = function(cmp, time) {
    return setTimeout(function() {
        var deferred = Ember.RSVP.defer('crud-table#pulling');
        cmp.sendAction('searchRecord', lastquery, deferred);
        deferred.promise.then(function(records) {
            //cmp.set('page_size', 0);
            metadata(records, cmp);
            cmp.set('value', records);
            regenerateView(cmp);
            PULLID = PULLFN(cmp, time);
        }, function(data) {
            console.log(data.message);
        });
    }, time);
};
var PULL = function(cmp) {
    clearTimeout(PULLID);
    PULLID = 0;
    if (cmp.get('pulling') > 0) {
        PULLID = PULLFN(cmp, cmp.get('pulling'));
    }
};
export default Ember.Component.extend({
    ComplexModel:{},
    pulling: false,
    stripped: false,
    search:true,
    hover: false,
    createRecord: 'create',
    updateRecord: 'update',
    deleteRecord: 'delete',
    cancelRecord: 'cancel',
    searchRecord: 'FetchData',
    newRecord: false,
    isDeleting: false,
    showMap: false,
    currentRecord: null,
    getRecord: 'getRecord',
    isLoading: null,
    isEdition: false,
    notEdition: true,
    SearchTerm: "",
    SearchField: "",
    Callback:null,
    value: [],
    layoutName: 'ember-cli-crudtable/default/base',
    class: "",
    fields: "id",
    labels: [],
    page_size:10,
    exports: true,
    actions: {
        select:function(record){
            this.set('currentRecord',record);
        },
        generic_callback:function(){
            this.set('Callback',arguments[0]);
            delete arguments[0];
            var args = ['Callback',this.get('currentRecord')].concat([].slice.call(arguments));
            this.sendAction.apply(this, args);  
            //this.sendAction('Callback',this.get('currentRecord'),arg1,arg2 );
            this.set('Callback',null);
        },
        internal_choose:function(incomming){
            this.set('Callback',incomming);
            this.sendAction('Callback', this.get('currentRecord') );
            this.set('Callback',null);
        },
        toJSONObject: function() {
            var data = [];
            this.get('ComplexModel').forEach(function(model) {
                var row = {};
                model.forEach(function(field) {
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

            if (link.click) {
                link.click();
            }

        },
        toTSV: function() {
            var data = [];
            var row = [];
            this.labels.forEach(function(field) {
                row.push(field.Display);
            });
            data.push(row);

            this.get('ComplexModel').forEach(function(model) {
                row = [];
                model.forEach(function(field) {
                    row.push(field.Value);
                });
                data.push(row);
            });
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function(infoArray, index) {
                var dataString = infoArray.join("\t");
                csvContent += index < data.length ? dataString + "\n" : dataString;
            });
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "table.tsv");
            this.set('dlf', link);
            if (link.click) {
                link.click();
            }
        },
        toCSV: function() {

            var data = [];
            var row = [];
            this.labels.forEach(function(field) {
                row.push(field.Display);
            });
            data.push(row);

            this.get('ComplexModel').forEach(function(model) {
                row = [];
                model.forEach(function(field) {
                    row.push(field.Value);
                });
                data.push(row);
            });
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function(infoArray, index) {
                var dataString = infoArray.join(",");
                csvContent += index < data.length ? dataString + "\n" : dataString;
            });
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "table.csv");
            this.set('dlf', link);
            if (link.click) {
                link.click();
            }
        },
        goto: function(page) {
            var that = this;
            var deferred = Ember.RSVP.defer('crud-table#goto');
            lastquery.page = page;
            that.set('isLoading', true);
            this.sendAction('searchRecord', lastquery, deferred);
            deferred.promise.then(function(records) {
                metadata(records, that);
                that.set('value', records);
                regenerateView(that);
                that.set('isLoading', false);
            }, function(data) {
                console.log(data);
                that.set('isLoading', false);
            });
        },
        internal_cancel: function() {
            this.set('notEdition', true);
            this.set('isEdition', false);
        },
        internal_search: function() {
            var field = $("#SearchField").val();
            var that = this;

            Object.keys(that.fields).forEach(function(fieldname) {
                if (that.fields[fieldname].Label === field) {
                    field = fieldname;
                }
            });
            var query = {
                page_size:this.get('page_size')
            };
            query[field] = this.get('SearchTerm');
            if (query[field] === "") {
                delete query[field];
            }
            lastquery = query;
            var deferred = Ember.RSVP.defer('crud-table#createRecord');
            that.set('isLoading', true);
            this.sendAction('searchRecord', query, deferred);
            deferred.promise.then(function(records) {
                metadata(records, that);
                that.set('value', records);
                regenerateView(that);
                that.set('isLoading', false);
            }, function(data) {
                console.log(data);
                that.set('isLoading', false);
            });
        },
        confirm: function() {
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
                record.forEach(function(prop) {
                    RoutedPropMap = prop;
                    switch (prop.Type) {
                        case 'googlemap':
                            map = record.get('map').getCenter();
                            prop.set('Value', map.toUrlValue());
                            break;
                        case 'many-multi':
                            break;
                    }
                });
                deferred = Ember.RSVP.defer('crud-table#updateRecord');
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': map
                }, function(results, status) {
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
            deferred.promise.then(function() {
                lastquery.page = that.get('pagination').current;
                that.sendAction('searchRecord', lastquery, updateview);
            }, function(data) {
                console.log(data);
                that.set('isEdition', false);
                that.set('notEdition', true);
                that.set('isLoading', false);
            });

            updateview.promise.then(function(records) {
                metadata(records, that);
                that.set('value', records);
                regenerateView(that);
                hidemodal();
                that.set('isEdition', false);
                that.set('isLoading', false);
                that.set('notEdition', true);
            }, function(data) {
                console.log(data);
                hidemodal();
                that.set('isEdition', false);
                that.set('isLoading', false);
                that.set('notEdition', true);
            });
        },
        internal_map: function(record, kind) {
            if (google === undefined) {

            }
            var that = this;
            that.set('showMap', true);
            showmodal();

            function mapit(id, latlng) {
                if (document.getElementById(id) == null) {
                    return false;
                }
                var mapOptions = {
                    zoom: latlng.zoom,
                    center: new google.maps.LatLng(latlng.lat, latlng.lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(document.getElementById(id), mapOptions);
                record.set('map', map);
                return true;
            }

            var cord = "";
            record.forEach(function(prop) {
                if (prop.Type === kind) {
                    cord = prop.Value.split(',');
                    cord = {
                        lat: cord[0],
                        lng: cord[1],
                        zoom: prop.Zoom.value
                    };
                }
            });
            var waitforgoogle = function(fn) {
                if (google === undefined) {
                    setTimeout(function() {
                        fn(fn);
                    }, 10);
                    return false;
                }
                if (mapit('google_map_canvas', cord)) {
                    setTimeout(function() {
                        that.set('currentRecord', record);
                    }, 1);
                } else {
                    setTimeout(function() {
                        fn(fn);
                    }, 10);
                }
            };
            waitforgoogle(waitforgoogle);
        },
        internal_create: function() {
            var that = this;
            that.set('newRecord', true);
            var deferred = Ember.RSVP.defer('crud-table#newRecord');
            that.sendAction('getRecord', deferred);
            deferred.promise.then(function(record) {
                Object.keys(proccesDef).forEach(function(field) {
                    record.set(field, proccesDef[field](that.get('targetObject').get('model')));
                });
                //TODO: Seems to be a ember mutable array bug Emberjs 1.13.1
                that.get('value').addObject(record._internalModel);
                regenerateView(that);
                that.set('currentRecord', that.get('ComplexModel').get('lastObject'));
                showmodal();
            }, function( /*data*/ ) {
                alert('Something went wrong');
            });
        },
        internal_edit: function(record) {
            this.set('notEdition', false);
            this.set('isEdition', true);
            this.set('isDeleting', false);
            this.set('currentRecord', record);
            //$("#CrudTableDeleteRecordModal .modal-title").html("Updating");
            showmodal();
        },
        internal_delete: function(record) {
            this.set('newRecord', false);
            this.set('isDeleting', true);
            this.set('currentRecord', record);
            showmodal();
        }
    },
    init: function() { 
        proccesDef = [];
        PreLoad = [];
        lastquery = {
            page: 1
        };
        PULLID = 0;
        var that = this;
        this._super();
        that.set('labels', []);
        Object.keys(this.get('fields')).forEach(function(key) {
            if (that.fields[key].Default !== undefined) {
                proccesDef[key] = that.fields[key].Default;
            }
            if (that.fields[key].List !== false) {
                that.get('labels').push({
                    Display: that.fields[key].Label,
                    Search: that.fields[key].Search || false
                });
            }
            if (that.fields[key].Source !== undefined) {
                Ember.assert('Action should be specified in Source field', that.fields[key].Source);
                var deferred = Ember.RSVP.defer('crud-table#dependant-table');
                PreLoad.push(deferred.promise);
                that.set('sideLoad', that.fields[key].Source);
                that.sendAction('sideLoad', deferred);
                deferred.promise.then(function(arr) {
                    var dep = that.get('dependants') || {};
                    dep[that.fields[key].Source] = arr;
                    that.set('dependants', dep);
                    that.set('sideLoad', null);
                }, function(data) {
                    var dep = that.get('dependants') || {};
                    dep[that.fields[key].Source] = {
                        isLoaded: true
                    };
                    that.set('dependants', dep);
                    that.set('sideLoad', null);
                    console.log(data.message);
                });

            }
        });
        this.set('editdelete', this.deleteRecord != null || this.updateRecord != null);
        this.init = function() {
            that._super();
        }.on('willInsertElement');
        this.addObserver('pulling', function() {
            PULL(that);
        });
    }.on('willInsertElement'),
    CurrentState:null,
    setup: function() {
        this.set('CurrentState','setup');
        var that = this;
        var deferred = Ember.RSVP.defer('crud-table#createRecord');
        that.set('isLoading', true);

        this.sendAction('searchRecord', {}, deferred);
        $(this).addClass(this.get('class'));

        deferred.promise.then(function(records) {
            metadata(records, that);
            that.set('value', records);
            that.set('isLoading', false);
            PULL(that);
        }, function(data) {
            console.log(data);
            that.set('isLoading', false);
        });
        PreLoad.push(deferred.promise);
        
        PromiseHandler = Ember.RSVP.defer('crud-table#SetUp');
        this.set('Promise',PromiseHandler.promise);
        PromiseHandler.resolve(true);

        Ember.RSVP.all(PreLoad).then(function() {
            regenerateView(that);
        });
        $('#CrudTableDeleteRecordModal').on('shown.bs.modal', function() {
            //modalpromise.resolve();
        });
        if( $("#CrudTableDeleteRecordModal").modal !== undefined){
            $("#CrudTableDeleteRecordModal").modal('hide');    
        }
        
        $('#CrudTableDeleteRecordModal').on('hidden.bs.modal', function() {
            var deferred = Ember.RSVP.defer('crud-table#cancelRecord');
            var template = Ember.RSVP.defer('crud-table#RenderTemplate');
            that.sendAction('cancelRecord', that.get('currentRecord').RoutedRecord, deferred);
            deferred.promise.then(function(args) {
                that.get('currentRecord').forEach(function(prop) {
                    switch (prop.Type) {
                        case 'many-multi':
                            prop.Display.forEach(function(property) {
                                console.log(property);
                                Ember.set(property, 'Added', false);
                            });
                            break;
                    }
                });
                if (args.remove) {
                    that.get('value').removeObject(args.record);
                }
                regenerateView(that);
                that.set('newRecord', false);
                that.set('isDeleting', false);
                that.set('currentRecord', null);
                that.set('showMap', false);
                template.resolve(true);
            }, function(data) {
                console.log(data);
            });
        });
        $('body').append($("#CrudTableDeleteRecordModal"));
    }.on('didInsertElement'),
    teardown: function() {
        $("#CrudTableDeleteRecordModal").remove();
    }.on('willDestroyElement'),
});
