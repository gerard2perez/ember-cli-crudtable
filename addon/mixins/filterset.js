import Ember from 'ember';
export default Ember.Mixin.create({
	computed:null,
	list:null,
	links:{
		or:"or",
		and:"and"
	},
	'many-multi':{
		'==':'Is',
		'!=':'Is not'
	},
	'belongsto':{
		'==':'Is',
		'!=':'Is not'
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
	create(){
		let that = this;
		return Ember.Object.extend({ 
			Key:null,
			Display:null,
			Condition:null,
			Value:null,
			Type:null,
			SelectObject:false,
			Options:null,
			Link:null,
			LinkLocale:Ember.computed('Link',function(){
				return that.links[this.get('Link')];
			})
		}).create({});
	},
	init(filters){
		this.set('list',Ember.ArrayProxy.create({ content: [] }) );
		(filters||[]).forEach(function(filter,index,arr){
			let link = index>0?arr[index-1].link:null;
			this.Add(filter.filters,link);
		}.bind(this));
	},
	localelink(link){
		return this.links[link];
	},
	makefilter(filter){
		return {
			key:filter.Key||filter.key,
			condition:filter.Condition||filter.condition,
			value:filter.Value||filter.value,
			link:filter.Link || filter.link,
			linklocale:this.links[filter.Link||filter.link]
		};
	},
	Add(filters,link){
		let that =this;
		filters=filters.map((filter)=>{return that.makefilter(filter)});
		if(this.list.content.length>0){
			let filt = this.list.objectAt(this.list.content.length-1);
			filt.set('link',link);
			filt.set('linklocale',that.links[link]);
		}
		this.list.addObject(Ember.Object.extend({link:null,filters:null}).create({filters:filters}));
	},
	getBody(query){
		query.filterset = this.list.map((filter)=>{
			return {
				filters:filter.filters,
				link:filter.link,
				linklocale:filter.linklocale
			};
		});
	}
});
