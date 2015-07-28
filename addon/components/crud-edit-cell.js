import Ember from 'ember';
function generatePass(plength){
    var mkrdn = function(){return 0.5-Math.random();};
    var keylistalpha="abcdefghijklmnopqrstuvwxyz";
    var keylistint="123456789";
    var keylistspec="!@#_";
    var temp='';
    var len = plength/2;
        len = len - 1;
    var lenspec = plength-len-len;
    var i = 0;
    for (i=0;i<len;i++){
        temp+=keylistalpha.charAt(Math.floor(Math.random()*keylistalpha.length));
    }

    for (i=0;i<lenspec;i++){
        temp+=keylistspec.charAt(Math.floor(Math.random()*keylistspec.length));
    }

    for (i=0;i<len;i++){
        temp+=keylistint.charAt(Math.floor(Math.random()*keylistint.length));

        temp=temp.split('').sort(mkrdn).join('');
    }

    return temp;
}
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
    belongsToCallback:'internal_choose',
    generic_callback:'generic_callback',
    renderMap: 'internal_map',
    getCenter: 'set',
    newpass:'newpass',
    actions: {
        newpass:function(record){
            record.set('Value',generatePass(10));
        },
        generic_callback:function(){
            var args = ['generic_callback'].concat([].slice.call(arguments));
            this.sendAction.apply(this, args);  
        },
        choose:function(recordparent){
            var select = this.element.getElementsByTagName('select')[0];
            recordparent.set('Value',{});
            for(var i=0; i < recordparent.Display.length; i++){
                Ember.set(recordparent.Display[i],'Added',false);
                if(recordparent.Display[i].Display === select.value){
                    recordparent.set('Value',recordparent.Display[i].Routed);
                    Ember.set(recordparent.Display[i],'Added',true);
                    if(recordparent.Choose!==undefined){
                        this.sendAction('belongsToCallback',recordparent.Choose);
                    }
                }
                
            }
        },
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