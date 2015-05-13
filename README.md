
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

After this you must install boostrap with bower

```
bower install bootstrap
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
### v0.4.1
1. Handles manytomany relations (many-multi)
2. Yout can now access the properties of the complex model by the name you defined in the model. (check custom templates seccion)
3. Error messages won't show and alert window, intead, the response will be log to the consoke.
4. Fiexed a bug that made modal window be created twice in the DOM so ... you know a mess.
5. Boostrap is a requiere dependency.
### V0.4.0
1. Support for Search key in controller configuration allowing to decide which fields are searchable.
2. layoutName can be defined in order to select a fully custom design if you don't like tables.

### v0.4.0-beta.3
1. Fixed a bug that prevent pulling from stopping.
2. Improved the map initialization.
3. Support for ReadOnly Fields.
4. Added the edit-cell-image template.
5. Added email datatype.

### v0.4.0-beta.2
1. Added support for data poolling every n milisecods.
2. Create button can now be hidden.
3. The export commands can now be hidden.

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
	Type: 'any_of_the_supported_datatypes,
	Zoom:'zoom_value_for_google_map_type'
	ReadOnly: true || false,
	Search: false || true
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

##Datatypes

Datatypes allow to make a custom predifined render of the data in the table, currente supported datatypes are:

1. **text**: It just render the informatión without any decoration, in edition mode it renders a input text.
2. **image**: It assumes that information if an url so it renders the image. In edition mode it render a input text.
3. **email**: Displays the email along with a button to mail the receiver, in edition mode it renders a input email.
4. **googlemap**: Render a link that shows a modal windown with the location it is important to notice this Type of field is by default ReadOnly.



##Custom Templates
The table which is generated depends on templates so you can choose whatever you like to be the render style of every cell in the table or the model window to update a field.

You must put your templetes under */templates/**ember-cli-crudtable**/template_name*

These are the current aviable templates to overwrite:

###Handlebars templates for data Read

a. table-cell-googlemap
a. table-cell-text
a. table-cell-image

You can access the data in handeblar using the next object

```
recod = {
	Field:'field_name',
	Value:'field_value',
	Display:'mask_field_value',
	ReadOnly: true || false
}
```

---

###Handlebars templates for data creation/update

a. edit-cell-googlemap
a. edit-cell-text
a. edit-cell-image
a. edit-cell-many-multi

You can access the data in handeblar using the next object

```
record = {
	Field:'field_name',
	Value:'field_value',
	Display:'mask_field_value'
	ReadOnly: true || false
}
```

---

###Other handlebars templates
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

##Hidding Edit,Delete,Create, Exports
All these commands can be hidden if you need just by setting to null their corresponding action in the handlebars herlper.

```
{{crud-table
	createRecord=null
	deleteRecord=null
	updateRecord=null
	exports=false
	
	fields=fieldDefinition	
}}
```


##many-multi

When defining a many-multi field you will have to specify the **Source** fiedl, which is the name of the model from the second table.

```
Some_Field:{
	Label:'Some_Label',
	Type:'many-multi',
	Display:'Name',
	Source:'second_table_on_the_manytomany_relation'
}
```

The complemnt will load all the field in the table specified in the Source field,
And will use the Display field has the property that will show the information from the loaded data.

##Data Pulling

ember-cli-crudtable has the hability to indicate and interval of time for reloading all data from the server.

You can do this by setting the pulling var in the template to the time you like to pull in milliseconds.
The default value if false (no pulling).

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
			Type:'text',
			Search: true
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
## Creating your own datatype
When You're defining the Type field in the controller yuo can especify a generic one.

Let's supose you want the field to have a link to some detail information, and we will define a Type **link**.

So our controller wil contain a field definition like this:

```
fieldDefinition:{
	Status:{
	Label:'Current State',
	Type:'link',
	ReadOnly:true
},
```

In order to compleat out goal we have to create a template file under **templates/ember-cli-crudtable** and call it **table-cell-link**

The definition of the template can be like this:

```
{{#link-to 'school.profesors' parent.RoutedRecord}}
	<span class="label label-primary pull-right" style="cursor:pointer">
	<i class="glyphicon glyphicon-user" style="cursor:pointer"></i>
	View All Profesors
	</span>
{{/link-to}}
```

That's all. You'll have a new field rendered as a link which is pointing to 'school.profesors' route.


##Upcoming
I'll create a website to show some examples if the downloads still increasing, thank you for using it.

I'm in a little hurry but as soon as posible i'll be adding more features and also providing a more detailed doc about the functions.
But try it, is quite simple to have your fully functional CRUD application.