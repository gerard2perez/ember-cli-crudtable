export default Ember.Component.extend({
    Display: function () {
        return this.get('displayLayout.Display');
    }.property('displayLayout'),
    Value: function () {
        return this.get('displayLayout.Value');
    }.property('displayLayout'),
    layoutName: function () {
        return 'crud-cell-' + this.get('displayLayout.Type');
    }.property('displayLayout'),
    renderMap: 'internal_map',
    parent:null,
    actions: {
        show_map: function () {
            this.sendAction('renderMap',this.get('parent'));
        }
    }
});
