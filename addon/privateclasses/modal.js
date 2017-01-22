import Ember from 'ember';
import ComplexModel from './complexmodel';

export default {
	target: null,
	promise: null,
	init(component) {
		let that = this;
		this.target = $('#CrudTableDeleteRecordModal');
		$('#CrudTableDeleteRecordModal').on('shown.bs.modal', function () {
			that.promise.resolve();
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
					ComplexModel.update(component);
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
		$('[data-role=crud-table]').parent().append($("#CrudTableDeleteRecordModal"));
	},
	hide() {
		if(this.target.modal){
			this.target.modal('hide');
		}
	},
	show() {
		this.promise = Ember.RSVP.defer('crud-table#showingmodal');
		if(this.target.modal){
			this.target.modal('show');
		}
	}
}
