import Ember from 'ember';
import CRUD from 'ember-cli-crudtable/components/crud-table';
import paginator from '../paginator/crudtable';
import filterset from '../filterset/crudtable';

export default Ember.Component.extend(CRUD, {
	renderer: {},
	filterset: filterset.create(),
	paginator() {
		return paginator.create();
	}
});
