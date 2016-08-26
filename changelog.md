# v1.3.0
1. Added support for filters
2. Fixed paginator problem when server not returning metadata information.

# v1.2.0
1. Added support to required, placeholder and pattern HTML attributes.
2. Support browser validations.
3. Paginator won't lose the current page reference.

# v1.1.2
1. Now the update modal shows the field name if no label is set.

# v1.1.1
1. Fixed a bug with ember-data RESTAdpater (v2.5.0+).
1. Default Label for fields.
1. Remove htmlbars deprecation.

# v1.1.0
1. Remove the bootstrap dependency.
1. Added support for custom paginators.
1. Fixed some bugs with the paginator.
1. Added support to change page size from the GUI.
1. Now your data can be exported to SQL.
1. Added support to sort field.
1. Added support  to show/hide fields.
1. More verbose ReadMe.
1. A lot of code improvements.
1. The component is now tested in Ember 1.13.0, 2.4.0, Beta, Release, Canary.

###v1.0.3
I've fixed the default value for the attribute List so it is true again (last release was false).
I've fixed most of the test cases and added some code so test run similar to a real case scenario.

This version was tested with ember-cli 1.3.8, ember 1.3.10 and 2.1.0, ember-data 1.3.5 and 2.1.0.

So you should have no problems, but if you have them I'll be glad to help.

See you later.

###v1.0.2
There was a little problem with jshint valitation so I just fix it.

###v1.0.1
Little error that prevent ... Bueno yo hablo español, así que hay les va cometí un pequeño error al llamar una función para dar formato.

### v1.0.0
Since this versión I'll put the changelog on the release section.

Maybe you want one of the older releases.
### v0.4.2
I made a lot of mistakes and v0.4.1 it's actually version v0.4.2 and I accidentally removed all the other versions from npm, but don't worry this version is still backwards compatible.

### v0.4.1
1. Handles manytomany relations (many-multi)
2. Yout can now access the properties of the complex model by the name you defined in the model. (check custom templates seccion)
3. Error messages won't show and alert window, intead, the response will be log to the console.
4. Fixed a bug that made modal window be created twice in the DOM so ... you know a mess.
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
1. Added support for data pooling every n millisecods.
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
