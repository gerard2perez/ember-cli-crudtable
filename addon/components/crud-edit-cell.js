import Ember from 'ember';
import password from '../privateclasses/passgen';
export default Ember.Component.extend({
	Display: Ember.computed('record', function () {
		console.log(this.get('record'));
		return this.get('record.Display');
	}),
	Value: Ember.computed('record', function () {
		return this.get('record.Value');
	}),
	layoutName: Ember.computed('record', function () {
		if (this.get('record.ReadOnly')) {
			return null;
		}
		return 'ember-cli-crudtable/edit-cell-' + this.get('record.Type');
	}),
	parent: null,
	belongsToCallback: 'internal_choose',
	generic_callback: 'generic_callback',
	renderMap: 'internal_map',
	getCenter: 'set',
	newpass: 'newpass',
	actions: {
		newpass: function (record) {
			record.set('Value', password.gen());
		},
		generic_callback: function () {
			var args = ['generic_callback'].concat([].slice.call(arguments));
			this.sendAction.apply(this, args);
		},
		choose: function (recordparent) {
			var select = this.element.getElementsByTagName('select')[0];
			recordparent.set('Value', {});
			for (var i = 0; i < recordparent.Display.length; i++) {
				Ember.set(recordparent.Display[i], 'Added', false);
				if (recordparent.Display[i].Display === select.value) {
					recordparent.set('Value', recordparent.Display[i].Routed);
					Ember.set(recordparent.Display[i], 'Added', true);
					if (recordparent.Choose !== undefined) {
						this.sendAction('belongsToCallback', recordparent.Choose);
					}
				}

			}
		},
		addto: function (recordparent, recordchild) {
			var isAdded = Ember.get(recordchild, 'Added');
			if (isAdded) {
				recordparent.get('Value').removeObject(recordchild.Routed);
			} else {
				recordparent.get('Value').pushObject(recordchild.Routed);
			}
			Ember.set(recordchild, 'Added', !isAdded);
		},
		show_map: function () {
			this.sendAction('renderMap', this.get('parent'));
		}
	}
});
