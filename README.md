
# CRUD Table [![Build Status](https://img.shields.io/travis/gerard2p/ember-cli-crudtable/v0.3.27.svg?style=flat-square)](https://travis-ci.org/gerard2p/ember-cli-crudtable) [![NPM Version](http://img.shields.io/npm/v/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable) [![NPM Downlaads](http://img.shields.io/npm/dm/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable)
This addon allows you to easly create a CRUD Table, it will take you only 5s!.

This component is compatible with bootstrap (Actually is a dependency, but it's downloaded automatically) and ember-data.

##Features
1. Create
2. Read
3. Update
4. Delete
5. Search by field
6. Pagination
7. Export to CSV, TSV, JSON
___

##Contributions
Please let me know about anything you find is not working, or maybe some features you want the component to perform. Any kind of comment will be well received, so thank you so mucho for using it.

---


##Installation
```
ember install ember-cli-crudtable
```

or

```
ember install:addon ember-cli-crudtable
```

---

##Current Status ![Current NPM](https://img.shields.io/github/tag/gerard2p/ember-cli-crudtable.svg)

(I'm not using any versioning convention, instead i'm just using the current date)

And I'll be releasing a new version every month or every 5 features I add.

You can use the next command to get the latest build

```
ember install ember-cli-crudtable@beta
```

or

```
ember install:addon ember-cli-crudtable@beta
```

---

##Changelog
Maybe you want one of the older relases.

### v0.4.0-beta.1
1. **fields** variable of the component now is and **object** an should be defined through the controller.
1. Added support to export results to CSV, TSV, JSON.
1. Custom labels.
1. Render-Cell by Type
	a. Text
	a. Google Map
	a. Image (Url)
1. Custom field render based on handelbars templates.
___


##How to use it
You can use the helper **{{crud-table}}** there are some minimun variables you must specify and these are:
###Minimun Configuration
1. class **The class name you want the component to have**
2. fields **The fields as a json object you want the component to render.**

The field definition is this:

```
field_name:{
	Label:'label_to_show_on_table_header',
	Display:'field_which_contain_data_to_show',
	Type: 'text' || 'googlemap' || 'image',
	Zoom:'zoom_value_for_google_map_type'
}
```
** *If not clear please check the example at the end* **.
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

###Custom Templates
The table which is generated depends on templates so you can choose whatever you like to be the render style of every cell in the table or the model window to update a field.

You must put your templetes under */templates/**ember-cli-crudtable**/template_name*

These are the current aviable templates to overwrite:

####Handlebars templates for data Read

a. table-cell-googlemap
a. table-cell-text

You can access the data in handeblar using the next object

```
recod = {
	Field:'field_name',
	Value:'field_value',
	Display:'mask_field_value'
}
```

---

####Handlebars templates for data creation/update

a. edit-cell-googlemap
a. edit-cell-text

You can access the data in handeblar using the next object

```
recod = {
	Field:'field_name',
	Value:'field_value',
	Display:'mask_field_value'
}
```

---

####Other handlebars templates
**modal-googlemap**

Contains the definition for waht will be shown in the modal window when, a googlemap field is defined.


**spinner**

This is the animation which is rendered when the crudtable is loading any content.



**table-modal**
This template contains the hole definition of the model window, by **the moment don't touch it!**.


**table-row**

This template recives a full row which be iterated through the *model* property.
The templace uses de **crud-cell** helper to determine which templete is goin to be rendered.


**table-update**

This template is render inside the modal window and calls every tamplate labeled edit-cell-*datatype* this template also calls the **crud-edit-cell** helper in order to determine which template is goin to be rendered.



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
    Location:attr('string'),
    Zoom:attr('number'),
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
export default Ember.ObjectController.extend(CrudTable,{
	fieldDefinition:{
		Name:{Label:'School'},
		Responsable:{
			Label:'Manager',
			Type:'text'
		},
		Location:{
			Label:'Google Map',
			Type:'googlemap'
			Display:'City',
			Zoom:'Zoom'
		},
	}
});
```


```
//app/templates/schools/index.hbs
{{crud-table 
fields=fieldDefinition -- NOW It Should be an object defined in the controller
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
I'll create a website to show some examples if the downloads still increasing, thank you for using it.

I'm in a little hurry but as soon as posible i'll be adding more features and also providing a more detailed doc about the functions.
But try it, is quite simple to have your fully functional CRUD application.