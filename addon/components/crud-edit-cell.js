import Ember from 'ember';
export default Ember.Component.extend({
    Display: function () {
        return this.get('record.Display');
    }.property('record'),
    Value: function () {
        return this.get('record.Value');
    }.property('record'),
    layoutName: function () {
        return 'ember-cli-crudtable/edit-cell-' + this.get('record.Type');
    }.property('record'),
    parent:null,
    renderMap: 'internal_map',
    getCenter: 'set',
    actions: {
        show_map: function () {
            this.sendAction('renderMap',this.get('parent'));
        }
    }
});
