/*globals $, google*/
import Ember from 'ember';
import ComplexModel from '../privateclasses/complexmodel';
import {actions,makeRequest,metadata,lastquery} from '../privateclasses/actions';
import modal from '../privateclasses/modal';

let component;
let proccesDef = [];
let PreLoad = [];

let PromiseHandler;
let PULLID = 0;
let PULLFN = function (cmp, time) {
	return setTimeout(function () {
		let deferred = Ember.RSVP.defer('crud-table#pulling');
		cmp.sendAction('searchRecord', lastquery, deferred);
		deferred.promise.then(function (records) {
				metadata(cmp, records);
				cmp.set('value', records);
				ComplexModel.update(component);
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
export default Ember.Mixin.create({
	_table: "",
	paginator:null,
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
	CurrentState: null,
	actions:actions,
	init: function () {
		component = this;
		component.get('paginator').init();
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
		PULLID = 0;
		PromiseHandler = Ember.RSVP.defer('crud-table#SetUp');
		component.addObserver('pulling', function () {
			PULL(component);
		});
		this._super(...arguments);
	},
	didInsertElement: function () {
		component.get('paginator').getBody(1, lastquery);
		makeRequest(component,lastquery);
		modal.init(component);
	},
	willDestroyElement: function () {
		$("#CrudTableDeleteRecordModal").remove();
	}
});
