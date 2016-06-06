
# CRUD Table [![NPM Version](http://img.shields.io/npm/v/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable)

[![Build Status](https://img.shields.io/travis/gerard2p/ember-cli-crudtable.svg?style=flat-square)](https://travis-ci.org/gerard2p/ember-cli-crudtable)[![Dependency Status](https://david-dm.org/gerard2p/ember-cli-crudtable.svg?style=flat-square)](https://david-dm.org/gerard2p/ember-cli-crudtable)[![devDependency Status](https://david-dm.org/gerard2p/ember-cli-crudtable/dev-status.svg?style=flat-square)](https://david-dm.org/gerard2p/ember-cli-crudtable#info=devDependencies)[![Code Climate](https://codeclimate.com/github/gerard2p/ember-cli-crudtable/badges/gpa.svg)](https://codeclimate.com/github/gerard2p/ember-cli-crudtable)

This addon allows you to easly create a CRUD Table, it will take you only 5s!.

This component is compatible with bootstrap and ember-data.

  [![NPM Downlaads](http://img.shields.io/npm/dm/ember-cli-crudtable.svg?style=flat-square)](https://www.npmjs.org/package/ember-cli-crudtable)[![Ember Observer Score](http://emberobserver.com/badges/ember-cli-crudtable.svg?style=flat-square)](http://emberobserver.com/addons/ember-cli-crudtable)[![Issue Count](https://codeclimate.com/github/gerard2p/ember-cli-crudtable/badges/issue_count.svg)](https://codeclimate.com/github/gerard2p/ember-cli-crudtable)

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
```npm
ember install ember-cli-crudtable
```

> All the classes which the plug-in uses are from bootstrap framework.

So you can install Bootsrap

```bash
bower install bootstrap --save
```

And don't forget to add these lines to ember-cli-build.js

```javascript
	app.import('bower_components/bootstrap/dist/js/bootstrap.js');
    app.import('bower_components/bootstrap/dist/css/bootstrap.css');
    app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.ttf', {
        destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff', {
        destDir: 'fonts'
    });
    app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2', {
        destDir: 'fonts'
    });
```

just before:

```javascript
return app.toTree();
```

---

##How to use it
You can use the helper **{{crud-table}}** there are some minimun variables you must specify and these are:
###Minimun Configuration
1. class **The class name you want the component to have**
2. fields **The fields as a json object you want the component to render.**

The field definition is this:

```javascript
field_name:{
	Label:'label_to_show_on_table_header',
	Display:'field_which_contain_data_to_show',
	Type: 'any_of_the_supported_datatypes',
	Zoom:'zoom_value_for_google_map_type'
	ReadOnly: true || false,
	Search: false || true
}
```
** *If not clear please check the example at the end* **.
###Action Configuration
These variables are completely optional, if you're using the integrated mixin for the controller and ember-data in your project.

1. createRecord: [default: '*create*']
1. updateRecord: [default: '*update*']
1. deleteRecord: [default: '*delete*']
1. cancelRecord: [default: '*cancel*']
	2. This actions is triggered when click on **"cancel"**, the default configuration makes a rollback on the record or deletes it if new.
1. getRecord: [default: '*getRecord*']
	2. This action creates a new empty record.
1. searchRecord: [default: '*FetchData*']
	2. This actions if the one which searches for your records.

###Style Configuration
1. stripped: [ true| **false** ]	-	Makes the table to render stripped.
1. hover: [ true | **false** ]		-	Allows to hover the table.

##Datatypes

Datatypes allow to make a custom predefined render of the data in the table, currently supported datatypes are:

1. **text**: It just render the informatión without any decoration, in edition mode it renders a input text.
2. **image**: It assumes that information if an url so it renders the image. In edition mode it render a input text.
3. **email**: Displays the email along with a button to mail the receiver, in edition mode it renders a input email.
4. **googlemap**: Render a link that shows a modal windown with the location it is important to notice this Type of field is by default ReadOnly.



##Custom Templates
The table which is generated depends on templates so you can choose whatever you like to be the render style of every cell in the table or the model window to update a field.

You must put your templates under */templates/**ember-cli-crudtable**/template_name*

These are the current aviable templates to overwrite:

###Handlebars templates for data Read

* table-cell-googlemap
* table-cell-text
* table-cell-image

You can access the data in handeblar using the next object

```javascript
recod = {
	Field:'field_name',
	Value:'field_value',
	Display:'mask_field_value',
	ReadOnly: true || false
}
```

---

###Handlebars templates for data creation/update

* edit-cell-googlemap
* edit-cell-text
* edit-cell-image
* edit-cell-many-multi

You can access the data in handeblar using the next object

```javascript
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

Contains the definition for what will be shown in the modal window when, a googlemap field is defined.


**spinner**

This is the animation which is rendered when the crudtable is loading any content.



**table-modal**
This template contains the hole definition of the model window, by **the moment don't touch it!**.


**table-row**

This template recives a full row which be iterated through the *model* property.
The template uses de **crud-cell** helper to determine which templete is goin to be rendered.


**table-update**

This template is render inside the modal window and calls every template labeled edit-cell-*datatype* this template also calls the **crud-edit-cell** helper in order to determine which template is going to be rendered.

##Hiding Edit,Delete,Create, Exports
All these commands can be hidden if you need just by setting to null their corresponding action in the handlebars herlper.

```handlebars
{{crud-table
	createRecord=null
	deleteRecord=null
	updateRecord=null
	exports=false
	
	fields=fieldDefinition	
}}
```


##many-multi

When defining a many-multi field you will have to specify the **Source** field, which is the name of the model from the second table.

```javascript
Some_Field:{
	Label:'Some_Label',
	Type:'many-multi',
	Display:'Name',
	Source:'second_table_on_the_manytomany_relation'
}
```

The component will load all the fields in the table specified in the Source field,
And will use the Display field has the property that will show the information from the loaded data.

##Data Pulling

ember-cli-crudtable has the hability to indicate and interval of time for reloading all data from the server.

You can do this by setting the **pulling** ley in the template to the time you like to pull in milliseconds.
The default value if false (no pulling).

##Controller Configuration
You can use this very same code when creating your controller and the only thing you have to worry about is to indicate the model.

```javascript
import CTABLE from 'ember-cli-crudtable/mixins/crud-controller';
import Ember from 'ember'

ley CrudTable = CTABLE('school');
export default Ember.ObjectController.extend(CrudTable);
```


##Full Example
```javascript
//app/router.js
import Ember from 'ember';
import config from './config/environment';

ley Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.baseURL
});

Router.map(function () {
    this.resource('schools');
});

export default Router;

```

```javascript
//app/models/school.js
import DS from 'ember-data';

ley attr = DS.attr;

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

```javascript
//app/controllers/schools/index.js
import CTABLE from 'ember-cli-crudtable/mixins/crud-controller';
import Ember from 'ember'

let CrudTable = CTABLE('school');
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
			Type:'googlemap',
			Display:'City',
			Zoom:'Zoom'
		},
	}
});
```


```handlebars
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

ember-cli-crudtable has an integrated mixin which is use by default to parse the metadata and the metadata structure it expects is defined as:


```javascript
{
	"meta":{
		"total":626
	}
}
```

The default paginator uses *skip* and *limit* to make a query request to your WEBAPI, so the next is a example of the requested url:

```url
www.webapi.com/yourmodel/?limit=10&skip=10
```

This request is equivalent to show 10 records by page and therefore it will be showing page 2.

The mixin calls and update function which set's all the internal values.

###Extending the paginator
if you need to change the paginator behavor you should create a file in **app/paginator/crudtable.js**
The next snippet is the default *paginator* implementation (which works with Sails.js and the Advanced Blueprints).

```javascript
import pagination from 'ember-cli-crudtable/mixins/pagination';
export default Ember.Object.extend(pagination);
```
###Changing the query parameters
**getBody( *page*, *query_params* )** is a function which is called when the query parameters need to be updated. So the function can be overrided to match your Web API implementation.

###I don't like the paginator look & feel
Easy, if you don't like the links that are generated you can override the **generateLinks()** functions from the paginator mixin.

Just remember this:

1. You must set the **links** parameter with and array of links.
1. The link object is like this:

```javascript
{
	page: <<number>> ,
	current: true | false 
}
```

This all is great, but what about the look, well
you can always override the template located in:

**app/templates/ember-cli-crudtable/default/pagination.hbs**

## Creating your own datatype
When You're defining the Type field in the controller yuo can especify a generic one.

Let's supose you want the field to have a link to some detail information, and we will define a Type **link**.

So our controller will contain a field definition like this:

```javascript
fieldDefinition:{
	Label:'Current State',
	Type:'link',
	ReadOnly:true
},
```

In order to complete our goal we have to create a template file under **templates/ember-cli-crudtable** and call it **table-cell-link**

The definition of the template can be like this:

```handlebars
<!--app/templates/ember-cli-crudtable/table-cell-link.hbs-->
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
