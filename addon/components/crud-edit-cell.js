import Ember from 'ember';
export default Ember.Component.extend({
    Display: function () {
        return this.get('record.Display');
    }.property('record'),
    Value: function () {
        return this.get('record.Value');
    }.property('record'),
    layoutName: function () {
        if(this.get('record.ReadOnly')){
            return null;
        }
        return 'ember-cli-crudtable/edit-cell-' + this.get('record.Type');
    }.property('record'),
    parent:null,
    renderMap: 'internal_map',
    getCenter: 'set',
    actions: {
        addto:function(recordparent,recordchild){
            var isAdded = Ember.get(recordchild,'Added');
            if(isAdded){
                recordparent.get('Value').removeObject(recordchild.Routed);
            }else{
                recordparent.get('Value').pushObject(recordchild.Routed);
            }
            Ember.set(recordchild,'Added',!isAdded);
        },
        show_map: function () {
            this.sendAction('renderMap',this.get('parent'));
        }
    }
});