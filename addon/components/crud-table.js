/*globals $, google*/
import Ember from 'ember';
import DF from '../utils/dateformat';
import pagination from '../mixins/pagination';
//import sorting from '../utils/sorting';
let component;

var modalpromise;
var proccesDef = [];
var PreLoad = [];
let lastquery = {};
var PromiseHandler;
var PULLID = 0;
var CustomField = Ember.Object.extend({
	Format: null,
	Field: null,
	Value: null,
	Type: null,
	Display: null,
	Label: null,
	Create: null,
	Read: null,
	Update: null,
	Delete: null,
	Edit: null,
	List: null,
	DisplayField: null,
	Suffix: null,
	Prefix: null,
	OnChoose: null,
	listener: Ember.observer('Value', () => {}),
	googlefield: Ember.observer('Display', () => {})
});
const checkvals = (cmp, records, cfield, field) => {
	if (cmp.fields[field].Source === undefined) {
		cfield.set('Display', records.get(cmp.fields[field].Display));
	} else {
		var datafinal = [];
		var deps = cmp.get('dependants')[cmp.fields[field].Source];
		deps.forEach(datadep => {
			var info = {
				Display: datadep.get(cmp.fields[field].Display),
				Routed: datadep,
				Added: false
			};
			if (records.any !== undefined) {
				records.any(record => {
					info.Added = datadep.get('id') === record.get('id');
					if (info.Added) {
						return true;
					}
				});
			} else {
				info.Added = datadep.get('id') === records.get('id');
			}
			datafinal.push(info);
		});
		cfield.set('Display', datafinal);
	}
};
const regenerateView = cmp => {
	const trytest = cmp.get('value').get('isLoaded') === true ? cmp.get('value') : cmp.get('value').get('content');
	var ComplexModel = [];
	trytest.forEach(row => {
		let CustomProperties = [];
		Object.keys(cmp.fields).forEach(field => {
			let data = row.get(field);
			let cfield = CustomField.create({
				Field: field,
				Value: data,
				Choose: cmp.fields[field].OnChoose,
				Display: DF.format(data, cmp.fields[field].Format),
				List: cmp.fields[field].List === false ? false : true,
				Suffix: cmp.fields[field].Suffix,
				Prefix: cmp.fields[field].Prefix,
				Label: cmp.fields[field].Label,
				Edit: cmp.fields[field].Edit || cmp.fields[field].ReadOnly || false,
				Create: cmp.fields[field].Create || false,
				Type: cmp.fields[field].Type || 'text',
				listener: Ember.observer('Value', () => {
					row.set(component.get('Field'), component.get('Value'));
					if (cmp.fields[field].Display === null) {
						row.set('Display', component.get('Value'));
					}
				}),
				googlefield: Ember.observer('Display', () => {
					if (component.get('DisplayField')) {
						row.set(component.get('DisplayField'), component.get('Display'));
					}
					component.set('Edit', cmp.fields[field].Edit || component.get('Type') === "googlemap");
				})
			});
			let Type = cfield.get('Type');
			let inherits = Type.split(':');
			if (inherits.length === 2) {
				Type = inherits[1];
				cfield.set('Type', inherits[0]);
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
						() => {
							checkvals(cmp, data, cfield, field);
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
			try {
				CustomProperties.pushObject(cfield);
			} catch (e) {
				CustomProperties.push(cfield);
			}
		});
		CustomProperties.RoutedRecord = row;
		try {
			ComplexModel.pushObject(CustomProperties);
		} catch (e) {
			ComplexModel.push(CustomProperties);
		}
	});
	cmp.set('ComplexModel', ComplexModel);
};
const showmodal = () => {
	modalpromise = Ember.RSVP.defer('crud-table#showingmodal');
	var modal = $("#CrudTableDeleteRecordModal");
	modal.modal('show');
};
const metadata = (records) => {
	component.get('paginator').update(component, records.get("meta"), records.get('length'));
	component.get('paginator').generateLinks();
};
const hidemodal = () => {
	try {
		$("#CrudTableDeleteRecordModal").modal('hide');
	} catch (e) {
		console.log("Fix component");
	}

};
var PULLFN = (cmp, time) => {
	return setTimeout(() => {
		var deferred = Ember.RSVP.defer('crud-table#pulling');
		cmp.sendAction('searchRecord', lastquery, deferred);
		deferred.promise.then(records => {
			metadata(records, cmp);
			cmp.set('value', records);
			regenerateView(cmp);
			PULLID = PULLFN(cmp, time);
		}, data => {
			console.log(data.message);
		});
	}, time);
};
var PULL = cmp => {
	clearTimeout(PULLID);
	PULLID = 0;
	if (cmp.get('pulling') > 0) {
		PULLID = PULLFN(cmp, cmp.get('pulling'));
	}
};

export default Ember.Component.extend({
	paginator: Ember.Object.extend(pagination).create(),
	ComplexModel: {},
	pulling: false,
	stripped: false,
	search: true,
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
	Callback: null,
	value: [],
	layoutName: 'ember-cli-crudtable/default/base',
	class: "",
	fields: "id",
	labels: [],
	exports: true,
	actions: {
		select(record) {
				component.set('currentRecord', record);
			},
			generic_callback() {
				component.set('Callback', arguments[0]);
				delete arguments[0];
				var args = ['Callback', component.get('currentRecord')].concat([].slice.call(arguments));
				component.sendAction.apply(component, args);
				component.set('Callback', null);
			},
			internal_choose(incomming) {
				component.set('Callback', incomming);
				component.sendAction('Callback', component.get('currentRecord'));
				component.set('Callback', null);
			},
			toJSONObject() {
				var data = [];
				component.get('ComplexModel').forEach(model => {
					var row = {};
					model.forEach(field => {
						row[field.Field] = field.Value;
					});
					data.push(row);
				});
				var csvContent = "data:text/json;charset=utf-8," + JSON.stringify(data);
				var encodedUri = encodeURI(csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "table.json");
				component.set('dlf', link);
				if (link.click) {
					link.click();
				}
			},
			toTSV() {
				var data = [];
				var row = [];
				component.labels.forEach(field => {
					row.push(field.Display);
				});
				data.push(row);

				component.get('ComplexModel').forEach(model => {
					row = [];
					model.forEach(field => {
						row.push(field.Value);
					});
					data.push(row);
				});
				var csvContent = "data:text/csv;charset=utf-8,";
				data.forEach(infoArray, index => {
					var dataString = infoArray.join("\t");
					csvContent += index < data.length ? dataString + "\n" : dataString;
				});
				var encodedUri = encodeURI(csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "table.tsv");
				component.set('dlf', link);
				if (link.click) {
					link.click();
				}
			},
			toCSV() {
				var data = [];
				var row = [];
				component.labels.forEach(field => {
					row.push(field.Display);
				});
				data.push(row);

				component.get('ComplexModel').forEach(model => {
					row = [];
					model.forEach(field => {
						row.push(field.Value);
					});
					data.push(row);
				});
				var csvContent = "data:text/csv;charset=utf-8,";
				data.forEach(infoArray, index => {
					var dataString = infoArray.join(",");
					csvContent += index < data.length ? dataString + "\n" : dataString;
				});
				var encodedUri = encodeURI(csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "table.csv");
				component.set('dlf', link);
				if (link.click) {
					link.click();
				}
			},
			goto(page) {
				var deferred = Ember.RSVP.defer('crud-table#goto');
				component.get('paginator').getBody(page, lastquery);
				component.set('isLoading', true);
				component.sendAction('searchRecord', lastquery, deferred);
				deferred.promise.then(records => {
					metadata(records);
					component.set('value', records);
					regenerateView(component);
					component.set('isLoading', false);
				}, () => {
					component.set('isLoading', false);
				});
			},
			internal_cancel() {
				component.set('notEdition', true);
				component.set('isEdition', false);
			},
			internal_search() {
				let field = $("#SearchField").val();
				Object.keys(component.fields).forEach(fieldname => {
					if (component.fields[fieldname].Label === field) {
						field = fieldname;
					}
				});
				let query = {};
				component.get('paginator').getBody(0, query);
				query[field] = component.get('SearchTerm');
				if (query[field] === "") {
					delete query[field];
				}
				lastquery = query;
				var deferred = Ember.RSVP.defer('crud-table#createRecord');
				component.set('isLoading', true);
				component.sendAction('searchRecord', query, deferred);
				deferred.promise.then(records => {
					metadata(records);
					component.set('value', records);
					regenerateView(component);
					component.set('isLoading', false);
				}, data => {
					component.set('isLoading', false);
				});
			},
			confirm() {
				var deferred;
				component.set('isLoading', true);
				if (component.get('newRecord')) {
					deferred = Ember.RSVP.defer('crud-table#createRecord');
					component.sendAction('createRecord', component.get('currentRecord').RoutedRecord, deferred);
				} else if (component.get('showMap')) {
					var record = component.get('currentRecord');
					var map;
					var RoutedPropMap;
					record.forEach(prop => {
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
					}, results, status => {
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
							} else {
								alert("address not found");
							}
						} else {
							alert("Geocoder failed due to: " + status);
						}
						component.sendAction('updateRecord', record.RoutedRecord, deferred);
					});
				} else {
					if (component.get('isDeleting')) {
						deferred = Ember.RSVP.defer('crud-table#deleteRecord');
						component.sendAction('deleteRecord', component.get('currentRecord').RoutedRecord, deferred);
					} else {
						deferred = Ember.RSVP.defer('crud-table#updateRecord');
						component.sendAction('updateRecord', component.get('currentRecord').RoutedRecord, deferred);
					}
				}
				var updateview = Ember.RSVP.defer('crud-table#pagination');
				deferred.promise.then(() => {
					if (component.get('paginator') !== undefined) {
						component.get('paginator').getBody(component.get('paginator').get('page'), lastquery);
					} else {
						delete lastquery.page;
					}
					component.sendAction('searchRecord', lastquery, updateview);
				}, () => {
					component.set('isEdition', false);
					component.set('notEdition', true);
					component.set('isLoading', false);
				});

				updateview.promise.then(records => {
					metadata(records);
					component.set('value', records);
					regenerateView(component);
					hidemodal();
					component.set('isEdition', false);
					component.set('isLoading', false);
					component.set('notEdition', true);
				}, () => {
					hidemodal();
					component.set('isEdition', false);
					component.set('isLoading', false);
					component.set('notEdition', true);
				});
			},
			internal_map(record, kind) {
				if (google === undefined) {

				}
				component.set('showMap', true);
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
				record.forEach(prop => {
					if (prop.Type === kind) {
						cord = prop.Value.split(',');
						cord = {
							lat: cord[0],
							lng: cord[1],
							zoom: prop.Zoom.value
						};
					}
				});
				var waitforgoogle = fn => {
					if (google === undefined) {
						setTimeout(() => {
							fn(fn);
						}, 10);
						return false;
					}
					if (mapit('google_map_canvas', cord)) {
						setTimeout(() => {
							component.set('currentRecord', record);
						}, 1);
					} else {
						setTimeout(() => {
							fn(fn);
						}, 10);
					}
				};
				waitforgoogle(waitforgoogle);
			},
			internal_create() {
				var trytest = component.get('value').get('isLoaded') === true ? component.get('value') : component.get('value').get('content');
				component.set('newRecord', true);
				var deferred = Ember.RSVP.defer('crud-table#newRecord');
				component.sendAction('getRecord', deferred);
				deferred.promise.then(record => {
					Object.keys(proccesDef).forEach(field => {
						record.set(field, proccesDef[field](component.get('targetObject').get('model')));
					});
					if (record._internalModel !== undefined) {
						trytest.addObject(record._internalModel);
					} else {
						trytest.push(record);
					}
					regenerateView(component);
					component.set('currentRecord', component.get('ComplexModel').get('lastObject'));
					showmodal();
				}, () => {
					alert('Something went wrong');
				});
			},
			internal_edit(record) {
				component.set('notEdition', false);
				component.set('isEdition', true);
				component.set('isDeleting', false);
				component.set('currentRecord', record);
				//$("#CrudTableDeleteRecordModal .modal-title").html("Updating");
				showmodal();
			},
			internal_delete(record) {
				component.set('newRecord', false);
				component.set('isDeleting', true);
				component.set('currentRecord', record);
				showmodal();
			}
	},
	init() {
		component = this;
		component.set('labels', []);
		Object.keys(component.get('fields')).forEach(key => {
			if (component.fields[key].Default !== undefined) {
				proccesDef[key] = component.fields[key].Default;
			}
			if (component.fields[key].List !== false) {
				component.get('labels').push({
					Display: component.fields[key].Label,
					Search: component.fields[key].Search || false
				});
			}
			if (component.fields[key].Source !== undefined) {
				Ember.assert('Action should be specified in Source field', component.fields[key].Source);
				var deferred = Ember.RSVP.defer('crud-table#dependant-table');
				PreLoad.push(deferred.promise);
				component.set('sideLoad', component.fields[key].Source);
				component.sendAction('sideLoad', deferred);
				deferred.promise.then(arr => {
					var dep = component.get('dependants') || {};
					dep[component.fields[key].Source] = arr;
					component.set('dependants', dep);
					component.set('sideLoad', null);
				}, data => {
					var dep = component.get('dependants') || {};
					dep[component.fields[key].Source] = {
						isLoaded: true
					};
					component.set('dependants', dep);
					component.set('sideLoad', null);
					console.log(data.message);
				});

			}
		});
		proccesDef = [];
		PreLoad = [];
		component.set('editdelete', component.deleteRecord != null || component.updateRecord != null);
		component.set('isLoading', true);
		component.get('paginator').init();
		PULLID = 0;
		PromiseHandler = Ember.RSVP.defer('crud-table#SetUp');
		component.addObserver('pulling', () => {
			PULL(component);
		});
		this._super(...arguments);
	},
	CurrentState: null,
	didInsertElement() {
		component.get('paginator').getBody(1, lastquery);
		var deferred = Ember.RSVP.defer('crud-table#createRecord');
		component.sendAction('searchRecord', lastquery, deferred);
		$(component).addClass(component.get('class'));
		deferred.promise.then(records => {
			metadata(records);
			component.set('value', records);
			component.set('isLoading', false);
			PULL(component);
		}, () => {
			component.set('isLoading', false);
		});
		PreLoad.push(deferred.promise);
		Ember.RSVP.all(PreLoad).then(() => {
			regenerateView(component);
			PromiseHandler.resolve(true);
		});
		$('#CrudTableDeleteRecordModal').on('shown.bs.modal', () => {
			modalpromise.resolve();
		});
		if ($("#CrudTableDeleteRecordModal").modal !== undefined) {
			$("#CrudTableDeleteRecordModal").modal('hide');
		}

		$('#CrudTableDeleteRecordModal').on('hidden.bs.modal', () => {
			var deferred = Ember.RSVP.defer('crud-table#cancelRecord');
			var template = Ember.RSVP.defer('crud-table#RenderTemplate');
			component.sendAction('cancelRecord', component.get('currentRecord').RoutedRecord, deferred);
			deferred.promise.then(args => {
				component.get('currentRecord').forEach(prop => {
					switch (prop.Type) {
					case 'many-multi':
						prop.Display.forEach(property => {
							Ember.set(property, 'Added', false);
						});
						break;
					}
				});
				if (args.remove) {
					component.get('value').removeObject(args.record);
				}
				regenerateView(component);
				component.set('newRecord', false);
				component.set('isDeleting', false);
				component.set('currentRecord', null);
				component.set('showMap', false);
				template.resolve(true);
			}, data => {
				console.log(data);
			});
		});
		$('body').append($("#CrudTableDeleteRecordModal"));
	},
	willDestroyElement() {
		$("#CrudTableDeleteRecordModal").remove();
	},
});
