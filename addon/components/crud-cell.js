import Ember from 'ember';
export default Ember.Component.extend({
    layoutName: function () {
        return 'ember-cli-crudtable/table-cell-' + this.get('record.Type');
    }.property('record'),
    renderMap: 'internal_map',
    parent:null,
    actions: {
        show_map: function () {
            this.sendAction( 'renderMap', this.get('parent'), this.get('record.Type') );
        },
        mailto:function(){
            document.location.href = "mailto:"+this.get('record.Value');
        }
    }
});
