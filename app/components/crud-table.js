import Ember from 'ember';
import CRUD from 'ember-cli-crudtable/components/crud-table';
import paginator from '../paginator/crudtable';
export default Ember.Component.extend(CRUD,{paginator:paginator.create()});
