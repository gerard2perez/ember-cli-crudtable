import Ember from 'ember';
export default Ember.Mixin.create({
	computed:null,
	list:null,
	'many-multi':{
		'==':'Is',
		'!=':'Is not'
	},
	create(){
		return Ember.Object.extend({
			Key:null,
			Condition:null,
			Value:null,
			Type:null,
			SelectObject:false,
			Options:null,
			Link:null
		}).create({});
	},
	number:{
		'>':'Bigger',
		'==':'Equal',
		'>=':'Bigger or Equal',
		'<':'Smaller',
		'<=':'Smaller or Equal'
	},
	text:{
		'==':'Equal',
		'like':'Contains'
	},
	init(filters){
		this.list = Ember.ArrayProxy.create({ content: [] });
		(filters||[]).forEach(function(filter,index,arr){
			let link = index>0?arr[index-1].link:null;
			this.Add(filter.filters,link);
		}.bind(this));
	},
	makefilter(filter){
		return {
			key:filter.Key,
			condition:filter.Condition,
			value:filter.Value,
			link:filter.Link
		};
	},
	Add(filters,link){
		let that =this;
		filters=filters.map((filter)=>{return that.makefilter(filter);});
		if(this.list.content.length>0){
			this.list.objectAt(this.list.content.length-1).set('link',link);
		}
		this.list.addObject(Ember.Object.extend({link:null,filters:null}).create({filters:filters}));
	},
	getBody(query){
		query.filterset = this.list.map((filter)=>{
			return {
				filters:filter.filters,
				link:filter.link
			};
		});
	}
});
