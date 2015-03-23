import Ember from 'ember';
import App from '../app';
//import EmberValidations from 'ember-validations';

export
default Ember.ObjectController.extend(/*EmberValidations.Mixin,*/ {
	needs: ['application'],
	isEditing: false,
	actions: {
        create: function (records) {
			var self = this;
			if (self.model.get('isNew')) {
				self.model.save().then(function () {
					self.send('emit', 'success', '¡Creado Exitosamente!');
					self.send('goback');
				}, function (e) {
					self.send('emit', 'error', 'Ha ocurrido un error al crear el registro. ' + e.responseText);
				});
			}
		},
        read:function(){

        },
		update: function () {
			var self = this;
			var promises = [];
			//if(self.model.get('isDirty')){
			promises.push(self.get('model').save());
			//}else{
			//	self.set('isEditing',false);
			//}
			Ember.A(Ember.keys(self.model._dependentRelations)).any(function (key) {
				var value = Ember.get(self.model, key);
				if (value.get('isDirty')) {
					promises.push(value.get('content').save());
				}
			});
			Ember.RSVP.Promise.all(promises).then(function () {
				self.set('isEditing', false);
				self.send('emit', 'success', 'Actualizado Correctamente');
			}, function (e) {
				self.send('emit', 'error', 'Ha ocurrido un error al crear el registro. ' + e.responseText);
			});

		},
		delete: function () {
			var self = this;
			this.model.destroyRecord().then(function () {
				self.send('emit', 'success', '¡Eliminado Corréctamente!');
				self.send('goback');
			},function(e){
				self.send('emit', 'error', 'Ha ocurrido un error al crear el registro. ' + e.responseText);
			});
		},
		cancel: function () {
			if (this.model.get('isDirty')) {
				this.model.rollback();
			}
			this.set('isEditing', false);
		},
		edit: function () {
			this.set('isEditing', true);
		}
	}
});
