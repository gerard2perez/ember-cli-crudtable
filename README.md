
# CRUD Table [![Build Status](https://img.shields.io/travis/gerard2p/ember-cli-crudtable.svg?branch=master&style=flat-square)](https://travis-ci.org/gerard2p/ember-cli-crudtable) [![NPM Version](http://img.shields.io/npm/v/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable) [![NPM Downlaads](http://img.shields.io/npm/dm/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable)
This addon allows you to easly create a CRUD Table, it will take you only 5s!.
___

##Development [![Build Status](https://img.shields.io/travis/gerard2p/ember-cli-crudtable.svg?style=flat-square&branch=development)](https://travis-ci.org/gerard2p/ember-cli-crudtable)

(I'm not using any versioning convention, instead i'm just using the current date)

###Change Log
v0.4.8

	1. Added support to export results to CSV, TSV, JSON
___

##Installation
```
ember install:addon ember-cli-crudtable
```

##How to use it
You can use the helper **{{crud-table}}** there are some minimun variables you must specify and these are:
###Minimun Configuration
1. class **The class name you want the component to have**
2. fields **The field names you want the component to render separated by ","**

###Action Configuration
These variables are completed optional, if you're using the integrated mixin for the controller.

1. createRecord: [default: '*create*']
1. updateRecord: [default: '*update*']
1. deleteRecord: [default: '*delete*']
1. cancelRecord: [default: '*cancel*']
	2. This actions is triggered when click on **"cancel"**, the default configuration makes a rollback on the record or deletes it if new.
1. getRecord: [default: '*getRecord*']
	2. This action creates a new empty record.
1. searchRecord: [default: '*FetchData*']
	2. This actions if the one witch searches for your records.

###Style Configuration
1. stripped: [ true| **false** ]	-	Makes the table to render stripped.
1. hover: [ true | **false** ]		-	Allows to hover the table.

##Controller Configuration
You can use this very same code when creating your controller and the only thing you have to worry about is to indicate the model.

```
import CTABLE from 'ember-cli-crudtable/mixins/crud-controller';
import Ember from 'ember'

var CrudTable = CTABLE('school');
export default Ember.ObjectController.extend(CrudTable);
```


##Full Example
```
//app/router.js
import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.baseURL
});

Router.map(function () {
    this.resource('schools');
});

export default Router;

```

```
//app/models/school.js
import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
    Name: attr('string'),
    City: attr('string'),
    Address: attr('string'),
    CP: attr('string'),
    Responsable:attr('string'),
    AmountStudents:attr('number')
});

```

```
//app/controllers/schools/index.js
import CTABLE from 'ember-cli-crudtable/mixins/crud-controller';
import Ember from 'ember'

var CrudTable = CTABLE('school');
export default Ember.ObjectController.extend(CrudTable);
```


```
//app/templates/schools/index.hbs
{{crud-table 
fields="Name,City,Address" 
deleteRecord='delete'
updateRecord='update' 
createRecord='create'}}
```

Thats All you can have now a fully CRUD table that communicates with your server and allows pagination.


##Pagination
The pagination data must be included in the meta response of your server so ember-data can use it and crudtable has access to it.

This is a sample meta:

```
{
	"meta":{
		"next":2,
		"previous"":null,
		"count":20
	}
}
```

##Upcoming
I'm in a little hurry but as soon as posible i'll be adding more features and also providing a more detailed doc about the functions.
But try it, is quite simple to have your fully functional CRUD application.