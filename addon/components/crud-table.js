/*globals $, google*/
import Ember from 'ember';
import dateformat from '../utils/dateformat';
import pagination from '../mixins/pagination';
//import sorting from '../utils/sorting';
let component;
let modalpromise;
let proccesDef = [];
let PreLoad = [];
let lastquery = {};
let PromiseHandler;
let PULLID = 0;
let CustomField = Ember.Object.extend({
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
	_field_cfg: null,
	Visible: Ember.computed.oneWay('_field_cfg.Visible'),
	listener: Ember.observer('Value', function () {}),
	googlefield: Ember.observer('Display', function () {})
});
const checkvals = function (cmp, records, cfield, field) {
	if (cmp.fields[field].Source === undefined) {
		cfield.set('Display', records.get(cmp.fields[field].Display));
	} else {
		let datafinal = [];
		let deps = cmp.get('dependants')[cmp.fields[field].Source];
		deps.forEach(function (datadep) {
			let info = {
				Display: datadep.get(cmp.fields[field].Display),
				Routed: datadep,
				Added: false
			};
			if (records.any !== undefined) {
				records.any(function (record) {
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
let newCustomField = function (field, data) {
	return CustomField.create({
		_field_cfg: component.get('labels')[field],
		Field: field,
		Value: data,
		Choose: component.fields[field].OnChoose,
		Display: dateformat.format(data, component.fields[field].Format),
		List: component.fields[field].List === false ? false : true,
		Suffix: component.fields[field].Suffix,
		Prefix: component.fields[field].Prefix,
		Label: component.fields[field].Label,
		Edit: component.fields[field].Edit || component.fields[field].ReadOnly || false,
		Create: component.fields[field].Create || false,
		Type: component.fields[field].Type || 'text',
		listener: Ember.observer('Value', function () {
			row.set(component.get('Field'), component.get('Value'));
			if (component.fields[field].Display === null) {
				row.set('Display', component.get('Value'));
			}
		}),
		googlefield: Ember.observer('Display', function () {
			if (component.get('DisplayField')) {
				row.set(component.get('DisplayField'), component.get('Display'));
			}
			component.set('Edit', component.fields[field].Edit || component.get('Type') === "googlemap");
		})
	});
}
const TypeAdjustments = function (Type, field, data, cfield, row) {
	switch (Type) {
	case 'check':
		if (this.fields[field].Value) {
			cfield.set('Display', 'checked="checked"');
		}
		break;
	case 'many-multi':
	case 'belongsto':
		if (data.isLoaded) {
			checkvals(this, data, cfield, field);
		} else {
			data.then(
				function () {
					checkvals(this, data, cfield, field);
				}
			);
		}
		break;
	case 'googlemap':
		if (this.fields[field].Display !== null) {
			cfield.set('Zoom', {
				value: row.get(this.fields[field].Zoom),
				field: this.fields[field].Zoom
			});
			cfield.set('Display', row.get(this.fields[field].Display));
			cfield.set('DisplayField', this.fields[field].Display);
		}
		break;
	}
	return cfield;
}
const regenerateView = function (cmp) {
	const trytest = cmp.get('value').get('isLoaded') === true ? cmp.get('value') : cmp.get('value').get('content');
	let ComplexModel = [];
	trytest.forEach(function (row) {
		let CustomProperties = [];
		Object.keys(cmp.fields).forEach(function (field) {
			let data = row.get(field);
			let cfield = newCustomField(field, data);
			let Type = cfield.get('Type');
			let inherits = Type.split(':');
			if (inherits.length === 2) {
				Type = inherits[1];
				cfield.set('Type', inherits[0]);
			}
			cfield = TypeAdjustments.apply(component, [Type, field, data, cfield, row]);
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
const showmodal = function () {
	modalpromise = Ember.RSVP.defer('crud-table#showingmodal');
	let modal = $("#CrudTableDeleteRecordModal");
	modal.modal('show');
};
const metadata = function (records) {
	component.get('paginator').update(component, records.get("meta"), records.get('length'));
	component.get('paginator').generateLinks();
};
const hidemodal = function () {
	try {
		$("#CrudTableDeleteRecordModal").modal('hide');
	} catch (e) {
		console.log("Fix component");
	}

};
let PULLFN = function (cmp, time) {
	return setTimeout(function () {
		let deferred = Ember.RSVP.defer('crud-table#pulling');
		cmp.sendAction('searchRecord', lastquery, deferred);
		deferred.promise.then(function (records) {
				metadata(records, cmp);
				cmp.set('value', records);
				regenerateView(cmp);
				PULLID = PULLFN(cmp, time);
			},
			function (data) {
				console.log(data.message);
			});
	}, time);
};
let PULL = function (cmp) {
	clearTimeout(PULLID);
	PULLID = 0;
	if (cmp.get('pulling') > 0) {
		PULLID = PULLFN(cmp, cmp.get('pulling'));
	}
};

const exportData = function (format, joinchar) {
	let data = [];
	let row = [];
	component.labels.forEach(function (field) {
		row.push(field.Display);
	});
	data.push(row);
	component.get('ComplexModel').forEach(function (model) {
		row = [];
		model.forEach(function (field) {
			row.push(field.Value);
		});
		data.push(row);
	});
	let content = "data:text/" + format + ";charset=utf-8,";
	data.forEach(function (infoArray, index) {
		let dataString = infoArray.join(joinchar);
		content += index < data.length ? dataString + "\n" : dataString;
	});
	content = encodeURI(content);
	let link = document.createElement("a");
	link.setAttribute("href", content);
	link.setAttribute("download", component.get('paginator').get('name') + "." + format);
	component.set('dlf', link);
	if (link.click) {
		link.click();
	}
}
const _getRequest = function (deferred, done, fail) {
	deferred.promise.then(function (records) {
			component.set("_table", records.type.modelName);
			metadata(records);
			component.set('value', records);
			regenerateView(component);
			component.set('isLoading', false);
			if (done) {
				done();
			}
		},
		function (data) {
			component.set('isLoading', false);
			if (fail) {
				fail();
			}
		});
}
const makeRequest = function (query, done, fail) {
	let deferred = Ember.RSVP.defer('crud-table#createRecord');
	component.set('isLoading', true);
	component.sendAction('searchRecord', query, deferred);
	_getRequest();
	return deferred;
}
export default Ember.Component.extend({
	_table: "",
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
	attributeBindings: ['data-role'],
	"data-role": "crud-table",
	classNameBindings: ['class'],
	class: "",
	fields: "id",
	labels: [],
	exports: true,
	actions: {
		select: function (record) {
			component.set('currentRecord', record);
		},
		generic_callback: function () {
			component.set('Callback', arguments[0]);
			delete arguments[0];
			let args = ['Callback', component.get('currentRecord')].concat([].slice.call(arguments));
			component.sendAction.apply(component, args);
			component.set('Callback', null);
		},
		internal_choose: function (incomming) {
			component.set('Callback', incomming);
			component.sendAction('Callback', component.get('currentRecord'));
			component.set('Callback', null);
		},
		toJSONObject: function () {
			let data = [];
			component.get('ComplexModel').forEach(function (model) {
				let row = {};
				model.forEach(function (field) {
					row[field.Field] = field.Value;
				});
				data.push(row);
			});
			let csvContent = "data:text/json;charset=utf-8," + JSON.stringify(data);
			let encodedUri = encodeURI(csvContent);
			let link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "table.json");
			component.set('dlf', link);
			if (link.click) {
				link.click();
			}
		},
		toTSV: function () {
			exportData("tsv", "\t");
		},
		toCSV: function () {
			exportData("csv", ",");
		},
		toSQL() {
			let data = [];
			component.get('ComplexModel').forEach(function (model) {
				let columns = [];
				let values = [];
				model.forEach(function (field) {
					columns.push(field.Field);
					values.push(field.Value);
				});
				data.push("INSERT INTO " + component.get('_table') + "(" + columns.join(",") + ") VALUES('" + values.join("','") + "')");
			});
			let csvContent = "data:text/sql;charset=utf-8," + data.join("\n");
			let encodedUri = encodeURI(csvContent);
			let link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", component.get('_table') + ".sql");
			component.set('dlf', link);
			if (link.click) {
				link.click();
			}
		},
		goto: function (page) {
			if (page !== 0 && component.get('paginator').get('current') !== page) {
				component.get('paginator').getBody(page, lastquery);
				makeRequest(lastquery);
			}
		},
		internal_cancel: function () {
			component.set('notEdition', true);
			component.set('isEdition', false);
		},
		internal_search: function () {
			let field = $("#SearchField").val();
			Object.keys(component.fields).forEach(function (fieldname) {
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
			makeRequest(lastquery);
		},
		confirm: function () {
			let deferred;
			component.set('isLoading', true);
			if (component.get('newRecord')) {
				deferred = Ember.RSVP.defer('crud-table#createRecord');
				component.sendAction('createRecord', component.get('currentRecord').RoutedRecord, deferred);
			} else if (component.get('showMap')) {
				let record = component.get('currentRecord');
				let map;
				let RoutedPropMap;
				record.forEach(function (prop) {
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
				let geocoder = new google.maps.Geocoder();
				geocoder.geocodefunction({
					'latLng': map
				}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							let add = results[0].formatted_address;
							let use = prompt('Suggested address is:\n' + add + '\n If you want to use it leave the field empty.');
							if (use === null || use === "") {
								record.RoutedRecord.set(RoutedPropMap.DisplayField, add);
							} else {
								record.RoutedRecord.set(RoutedPropMap.DisplayField, use);
							}
							record.RoutedRecord.set(RoutedPropMap.Zoom.field, record.get('map').getZoom());
						} else {
							console.warn("address not found");
						}
					} else {
						console.warn("Geocoder failed due to: " + status);
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
			let updateview = Ember.RSVP.defer('crud-table#pagination');
			deferred.promise.then(function () {
				if (component.get('paginator') !== undefined) {
					component.get('paginator').getBody(component.get('paginator').get('page'), lastquery);
				} else {
					delete lastquery.page;
				}
				component.sendAction('searchRecord', lastquery, updateview);
			}, function () {
				component.set('isEdition', false);
				component.set('notEdition', true);
				component.set('isLoading', false);
			});
			_getRequest(updateview, function () {
				hidemodal();
				component.set('isEdition', false);
				component.set('notEdition', true);
			}, function () {
				hidemodal();
				component.set('isEdition', false);
				component.set('notEdition', true);
			})
		},
		internal_order: function (label) {
			component.get('labels').forEach(function (lbl) {
				if (label !== lbl) {
					Ember.set(lbl, 'Order_ASC', false);
					Ember.set(lbl, 'Order_DESC', false);
					Ember.set(lbl, 'Order', 0);
				}
			});
			//label.set('Order_ASC',true);
			if (!Ember.get(label, 'Order_DESC')) {
				Ember.set(label, 'Order_ASC', false);
				Ember.set(label, 'Order_DESC', true);
				Ember.set(label, 'Order', 2);
			} else {
				Ember.set(label, 'Order_ASC', true);
				Ember.set(label, 'Order_DESC', false);
				Ember.set(label, 'Order', 1);
			}
			this.get('paginator').sortData(label, lastquery);
			makeRequest(lastquery);

		},
		internal_map: function (record, kind) {
			if (google === undefined) {
				return;
			}
			component.set('showMap', true);
			showmodal();

			function mapit(id, latlng) {
				if (document.getElementById(id) === null) {
					return false;
				}
				let mapOptions = {
					zoom: latlng.zoom,
					center: new google.maps.LatLng(latlng.lat, latlng.lng),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				let map = new google.maps.Map(document.getElementById(id), mapOptions);
				record.set('map', map);
				return true;
			}

			let cord = "";
			record.forEach(function (prop) {
				if (prop.Type === kind) {
					cord = prop.Value.split(',');
					cord = {
						lat: cord[0],
						lng: cord[1],
						zoom: prop.Zoom.value
					};
				}
			});
			let waitforgoogle = function (fn) {
				if (google === undefined) {
					setTimeout(function () {
						fn(fn);
					}, 10);
					return false;
				}
				if (mapit('google_map_canvas', cord)) {
					setTimeout(function () {
						component.set('currentRecord', record);
					}, 1);
				} else {
					setTimeout(function () {
						fn(fn);
					}, 10);
				}
			};
			waitforgoogle(waitforgoogle);
		},
		internal_create: function () {
			let records = component.get('value').get('isLoaded') === true ? component.get('value') : component.get('value').get('content');
			component.set('newRecord', true);
			let deferred = Ember.RSVP.defer('crud-table#newRecord');
			component.sendAction('getRecord', deferred);
			deferred.promise.then(function (record) {
					Object.keys(proccesDef).forEach(function (field) {
						record.set(field, proccesDef[field](component.get('targetObject').get('model')));
					});
					if (record._internalModel !== undefined) {
						records.addObject(record._internalModel);
					} else {
						records.push(record);
					}
					regenerateView(component);
					component.set('currentRecord', component.get('ComplexModel').get('lastObject'));
					showmodal();
				},
				function () {
					console.debug('Something went wrong');
				});
		},
		internal_edit: function (record) {
			component.set('notEdition', false);
			component.set('isEdition', true);
			component.set('isDeleting', false);
			component.set('currentRecord', record);
			//$("#CrudTableDeleteRecordModal .modal-title").html("Updating");
			showmodal();
		},
		internal_delete: function (record) {
			component.set('newRecord', false);
			component.set('isDeleting', true);
			component.set('currentRecord', record);
			showmodal();
		},
		intetnal_setlimit: function (limit) {
			limit = limit === "all" ? component.get('paginator').get('total') : limit;
			component.get('paginator').set('limit', limit);
			component.get('paginator').getBody(1, lastquery);
			makeRequest(lastquery);
		},
		internal_reload() {
			makeRequest(lastquery);
		}
	},
	init: function () {
		component = this;
		component.set('labels', []);
		Object.keys(component.get('fields')).forEach(function (key) {
			if (component.fields[key].Default !== undefined) {
				proccesDef[key] = component.fields[key].Default;
			}
			if (component.fields[key].List !== false) {
				let label_cfg = Ember.Object.create({
					Visible: true,
					Key: key,
					Display: component.fields[key].Label,
					Search: component.fields[key].Search || false,
					Order: 0,
					Order_ASC: false,
					Order_DESC: false
				});
				component.get('labels').push(label_cfg);
				component.get('labels')[key] = label_cfg;
			}
			if (component.fields[key].Source !== undefined) {
				Ember.assert('Action should be specified in Source field', component.fields[key].Source);
				let deferred = Ember.RSVP.defer('crud-table#dependant-table');
				PreLoad.push(deferred.promise);
				component.set('sideLoad', component.fields[key].Source);
				component.sendAction('sideLoad', deferred);
				deferred.promise.then(function (arr) {
						let dep = component.get('dependants') || {};
						dep[component.fields[key].Source] = arr;
						component.set('dependants', dep);
						component.set('sideLoad', null);
					},
					function (data) {
						let dep = component.get('dependants') || {};
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
		component.set('editdelete', component.deleteRecord !== null || component.updateRecord !== null);
		component.set('isLoading', true);
		component.get('paginator').init();
		PULLID = 0;
		PromiseHandler = Ember.RSVP.defer('crud-table#SetUp');
		component.addObserver('pulling', function () {
			PULL(component);
		});
		this._super(...arguments);
	},
	CurrentState: null,
	didInsertElement: function () {
		component.get('paginator').getBody(1, lastquery);
		makeRequest(lastquery);
		$('#CrudTableDeleteRecordModal').on('shown.bs.modal', function () {
			modalpromise.resolve();
		});
		if ($("#CrudTableDeleteRecordModal").modal !== undefined) {
			$("#CrudTableDeleteRecordModal").modal('hide');
		}
		$('#CrudTableDeleteRecordModal').on('hidden.bs.modal', function () {
			let deferred = Ember.RSVP.defer('crud-table#cancelRecord');
			let template = Ember.RSVP.defer('crud-table#RenderTemplate');
			component.sendAction('cancelRecord', component.get('currentRecord').RoutedRecord, deferred);
			deferred.promise.then(function (args) {
					component.get('currentRecord').forEach(function (prop) {
						switch (prop.Type) {
						case 'many-multi':
							prop.Display.forEach(function (property) {
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
				},
				function (data) {
					console.log(data);
				});
		});
		$('body').append($("#CrudTableDeleteRecordModal"));
	},
	willDestroyElement: function () {
		$("#CrudTableDeleteRecordModal").remove();
	}
});
