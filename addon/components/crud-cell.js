import Ember from 'ember';
export default Ember.Component.extend({
	layoutName: Ember.computed('record', function () {
		return 'ember-cli-crudtable/table-cell-' + this.get('record.Type');
	}),
	renderMap: 'internal_map',
	generic_callback: 'generic_callback',
	parent: null,
	actions: {
		generic_callback: function (action, arg1, arg2, arg3) {
			this.sendAction('generic_callback', action, arg1, arg2, arg3);
		},
		show_map: function () {
			this.sendAction('renderMap', this.get('parent'), this.get('record.Type'));
		},
		mailto: function () {
			document.location.href = "mailto:" + this.get('record.Value');
		}
	}
});
