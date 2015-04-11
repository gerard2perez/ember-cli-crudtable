import Ember from 'ember';
export default Ember.Component.extend({
    layoutName: function () {
        return 'crud-cell-' + this.get('record.Type');
    }.property('record'),
    renderMap: 'internal_map',
    parent:null,
    actions: {
        show_map: function () {
            this.sendAction('renderMap',this.get('parent'));
        }
    }
});
