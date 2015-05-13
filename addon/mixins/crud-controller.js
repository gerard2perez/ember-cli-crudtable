import Ember from 'ember';

export default function (model) {
    return Ember.Mixin.create({
        isEditing: false,
        actions: {
            FetchData:function(query,deferred){
                this.store.find(model,query).then(deferred.resolve,deferred.reject);
            },
            getRecord: function (deferred) {
                deferred.resolve(this.store.createRecord(model));
            },
            create: function (record, deferred) {
                if (record.get('isNew')) {
                    record.save().then(deferred.resolve, deferred.reject);
                }
            },
            read: function () {

            },
            update: function (record, deferred) {
                var that = this;
                var promises = [];
                //if(self.model.get('isDirty')){
                promises.push(record.save());
                //}else{
                //	self.set('isEditing',false);
                //}
                Ember.A(Ember.keys(record._relationships)).any(function (key) {
                    var value = Ember.get(record, key);
                    if (value.get('isDirty')) {
                        promises.push(value.get('content').save());
                    }
                });
                Ember.RSVP.Promise.all(promises).then(deferred.resolve, deferred.reject);

            },
            delete: function (record, deferred) {
                record.destroyRecord().then(deferred.resolve, deferred.reject);
            },
            cancel: function (record, deferred) {
                var remove = false;
                if (record.get('isNew')) {
                    record.deleteRecord();
                    remove = true;
                }
                if (record.get('isDirty')) {
                    record.rollback();
                }
                deferred.resolve({record:record,remove:remove});
            }
        }
    });
}
