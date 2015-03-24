import Ember from 'ember';
//import App from '../app';
//import EmberValidations from 'ember-validations';

export default function (model /*settings*/) {
    return Ember.ObjectController.extend({
        isEditing: false,
        actions: {
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
                record.save().then(deferred.resolve, deferred.reject);
                //var self = this;
                //var promises = [];
                //if(self.model.get('isDirty')){
                //promises.push(record.save());
                //}else{
                //	self.set('isEditing',false);
                //}
                /*Ember.A(Ember.keys(record._dependentRelations)).any(function (key) {
                    var value = Ember.get(self.model, key);
                    if (value.get('isDirty')) {
                        promises.push(value.get('content').save());
                    }
                });*/
                //Ember.RSVP.Promise.all(promises).then(deferred.resolve, deferred.reject);

            },
            delete: function (record, deferred) {
                record.destroyRecord().then(deferred.resolve, deferred.reject);
            },
            cancel: function (record, deferred) {
                if (record.get('isDirty')) {
                    record.rollback();
                }
                if (record.get('isNew')) {
                    record.deleteRecord();
                }
                deferred.resolve(true);
            }
        }
    });
}
