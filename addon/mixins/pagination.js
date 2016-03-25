import Ember from 'ember';
export default Ember.Mixin.create({
	name: "Custom Name",
	sortingString: "field ORDER",
	sortingKey: ["ASC", "DESC"],
	render: false,
	current: 0,
	previous: 0,
	next: 0,
	total: 0,
	pages: 0,
	limit: 10,
	skip: 0,
	from: 0,
	to: 0,
	links: [],
	init() {
		this.set('render', true);
	},
	sortData(field, query) {
		query.sort =
			this.get("sortingString")
			.replace("field", Ember.get(field, 'Key'))
			.replace("ORDER", this.get('sortingKey')[Ember.get(field, 'Order') - 1]);
	},
	getBody(page, query) {
		query.skip = (page - 1) * this.get('limit');
		this.set('skip', query.skip < 1 ? 0 : query.skip);
		query.limit = this.get('limit');
		if (query.skip < 1) {
			delete query.skip;
		}
		if (!query.limit) {
			delete query.limit;
		}
	},
	update(component, meta, nelements) {
		if(meta.count!==undefined){
			meta.total = meta.count;
		}
		this.set('total', meta.total);
		let current = Math.ceil(this.get('skip') / this.get('limit')) + 1;
		let pages = Math.ceil(this.get('total') / this.get('limit'));
		this.set('pages', pages);
		this.set('current', current);
		this.set('from', this.get('skip') + 1);
		this.set('to', this.get('from') + nelements - 1);
		this.set('previous', current > 1 ? current - 1 : 0);
		this.set('next', current < pages ? current + 1 : 0);
	},
	generateLinks() {
		const slots = 1;
		const siblings = 3;
		let cur = this.get('current');
		let pages = this.get('pages');
		let arr = [];
		var max = siblings * 2 + slots * 2 + 3;
		var de1 = slots;
		var de2 = cur - siblings;
		var df2 = pages - slots + 1;
		var df1 = cur + siblings;
		var compress = pages > max;
		var preadd = true;
		var postadd = true;
		for (var i = 1; i <= pages; i++) {
			if (compress) {
				var TP = max - ((pages - cur) + siblings + 1 + slots + 1);
				var TP2 = max - (cur + siblings + 1 + slots);
				if ((de1 < i && i < de2) && i < de2 - TP) {
					if (preadd) {
						preadd = false;
						arr.push({
							page: "..",
							current: false
						});
					}
				} else if ((df1 < i && i < df2) && i > df1 + TP2) {
					if (postadd) {
						postadd = false;
						arr.push({
							page: "..",
							current: false
						});
					}
				} else {
					arr.push({
						page: i,
						current: cur === i
					});
				}

			} else {
				arr.push({
					page: i,
					current: cur === i
				});
			}
		}
		this.set('links', arr);
	}
});
