import Ember from 'ember';
export default Ember.Mixin.create({
	filterupdated:false,
	computed: null,
	filtergroups: null,
	links: {
		or: "or",
		and: "and"
	},
	'many-multi': {
		'==': 'Is',
		'!=': 'Is not'
	},
	'belongsto': {
		'==': 'Is',
		'!=': 'Is not'
	},
	number: {
		'>': 'Bigger',
		'==': 'Equal',
		'>=': 'Bigger or Equal',
		'<': 'Smaller',
		'<=': 'Smaller or Equal'
	},
	text: {
		'==': 'Equal',
		'like': 'Contains'
	},
// 	createFiltergroup(filters, link) {
// 		let that = this;
// 		return Ember.ArrayProxy.extend({
// 			Link: null,
// 			LinkLocale: Ember.computed('Link', function() {
// 				return that.links[this.Link];
// 			}),
// 			isvalid: Ember.computed('content.@each.Ready', function() {
// 				let a = this.content.filterBy('Ready', false);
// 				return this.content.filterBy('Ready', false).length === 0;
// 			})
// 		}).create({
// 			Link: link || "or",
// 			content: filters || [] //Ember.ArrayProxy.create()
// 		});
// 	},
// 	create(base) {
// 		let that = this;
// 		return Ember.Object.extend({
// 			Display: null,
// 			Key: null,
//
// 			Condition: null,
// 			ConditionMask: Ember.computed('Condition', function() {
// 				return (this.Options || {})[this.Condition] || "";
// 			}),
//
// 			Value: null,
// 			ValueMask: null,
//
// 			display:Ember.computed.alias('Display'),
// 			key:Ember.computed.alias('Key'),
// 			condition:Ember.computed.alias('Condition'),
// 			value:Ember.computed.alias('Value'),
// 			valuemask:Ember.computed.alias('ValueMask'),
// 			link:Ember.computed.alias('Link'),
//
//
// 			//Type:null,
// 			SelectObject: false,
// 			Options: null,
// 			Link: null,
// 			Readable: Ember.computed('Display', 'ConditionMask', 'ValueMask', function() {
// 				return this.Display + " " + this.get('ConditionMask') + " " + this.ValueMask;
// 			}),
// 			Ready: Ember.computed('Display', 'Condition', 'Value', function() {
// 				return !!(this.Display && this.Condition && this.Value);
// 				// return `${this.get('Key')} ${this.get('Condition')} ${this.get('Display')}`;
// 			}),
// 			LinkLocale: Ember.computed('Link', function() {
// 				return that.links[this.Link];
// 			})
// 		}).create(base || {});
// 	},
// 	init(filters) {
// 		this.set('filtergroups', Ember.ArrayProxy.extend({
// 			areValid: Ember.computed('content.@each.isvalid', function() {
// 				return this.content.filterBy('isvalid', false).length === 0;
// 			})
// 		}).create({
// 			content: []
// 		}));
// 		(filters || this.createFiltergroup().addObject(this.create())).forEach(function(filter, index, arr) {
// 			let link = index > 0 ? arr[index - 1].link : null;
// 			this.AddFilterGroup(filter.filters, link);
// 		}.bind(this));
// 	},
// 	change(filters){
// 		this.init(filters);
// 		this.set('filterupdated',!this.set('filterupdated'));
// 	},
// 	localelink(link) {
// 		return this.links[link];
// 	},
// 	makefilter(filter) {
// 		return filter;
// 	},
// 	AddFilterGroup(filters, link) {
// 		let that = this;
// 		filters = filters || [this.create()];
// 		link = link || "or";
// 		filters = filters.map((filter) => {
// 			return that.create(filter)
// 		});
// 		if (this.filtergroups.content.length > 0) {
// 			let filt = this.filtergroups.objectAt(this.filtergroups.content.length - 1);
// 			filt.set('Link', link);
// 		}
// 		this.filtergroups.addObject(this.createFiltergroup(filters, link));
// 	},
	getBody(query) {
		query.filterset = (this.filtergroups||[]).map((filter) => {
			return {
				filters: filter.content.map((filter)=>{
					return {
						key:filter.Key,
						condition:filter.Condition,
						value:filter.Value,
						link:filter.Link
					};
				}),
				link: filter.Link
			};
		});
	},
// 	Query:Ember.computed('filtergroups.content.@each.isvalid',function(){
// 		let query = {filterset:{}};
// 		this.getBody(query);
// 		return query.filterset;
// 	})
});
