import Ember from 'ember';
import dateformat from '../utils/dateformat';

const checkvals = function (cmp, records, cfield, field) {
	if (cmp.fields[field].Source === undefined) {
		cfield.set('Display', records.get(cmp.fields[field].Display));
	} else {
		let datafinal = [];
		let deps = cmp.get('dependants')[cmp.fields[field].Source];
		deps.forEach(function (datadep) {
			let info = {
				Display: datadep.get(cmp.fields[field].Display),
				Routed: datadep,
				Added: false
			};
			if (records.any !== undefined) {
				records.any(function (record) {
					info.Added = datadep.get('id') === record.get('id');
					if (info.Added) {
						return true;
					}
				});
			} else {
				info.Added = datadep.get('id') === records.get('id');
			}
			datafinal.push(info);
		});
		cfield.set('Display', datafinal);
	}
};
const CustomField = Ember.Object.extend({
	IsRequired:null,
	Pattern:null,
	Format: null,
	Field: null,
	Value: null,
	Type: null,
	Display: null,
	Label: null,
	Create: null,
	Read: null,
	Update: null,
	Delete: null,
	Edit: null,
	List: null,
	DisplayField: null,
	Suffix: null,
	Prefix: null,
	OnChoose: null,
	PlaceHolder:null,
	_lbl_field_cfg: null,
	Visible: Ember.computed.oneWay('_lbl_field_cfg.Visible'),
	listener: Ember.observer('Value', function () {}),
	googlefield: Ember.observer('Display', function () {})
});
let newCustomField = function (component, field, data,row) {
	return CustomField.create({
		PlaceHolder:component.fields[field].PlaceHolder || null,
		IsRequired:component.fields[field].IsRequired || false,
		Pattern:component.fields[field].Pattern || null,
		_lbl_field_cfg: component.get('labels')[field],
		_field_cfg:component.fields[field],
		Field: row[field]===undefined ? field.toLowerCase() : field,
		Value: data,
		Choose: component.fields[field].OnChoose,
		Display: dateformat.format(data, component.fields[field].Format),
		List: component.fields[field].List === false ? false : true,
		Suffix: component.fields[field].Suffix,
		Prefix: component.fields[field].Prefix,
		Label: component.fields[field].Label || field,
		Edit: component.fields[field].Edit || component.fields[field].ReadOnly || false,
		Create: component.fields[field].Create || false,
		Type: component.fields[field].Type || 'text',
		listener: Ember.observer('Value', function () {
			row.set(this.get('Field'), this.get('Value'));
			if (component.fields[field].Display === null) {
				row.set('Display', this.get('Value'));
			}
		}),
		googlefield: Ember.observer('Display', function () {
			if (component.get('DisplayField')) {
				row.set(component.get('DisplayField'), component.get('Display'));
			}
			component.set('Edit', component.fields[field].Edit || component.get('Type') === "googlemap");
		})
	});
}
const TypeAdjustments = function (component, Type, field, data, cfield, row) {
	let fobj = component.get('fields')[field];
	switch (Type) {
	case 'check':
		if (fobj.Value) {
			cfield.set('Display', 'checked="checked"');
		}
		break;
	case 'catalog':
		function map(dt){
			return dt.map((r)=>{
				return r.get(cfield._field_cfg.Display);
			});
		}
		let deps = component.get('dependants')[component.fields[field].Source];
		if (deps.isLoaded) {
			cfield.set('related',map(deps));
		} else {
			deps.then(function () {
				cfield.set('related',map(deps));
			});
		}
		break;
	case 'many-multi':
	case 'belongsto':
		if (data.isLoaded) {
			checkvals(component, data, cfield, field);
		} else {
			data.then(function () {
				checkvals(component, data, cfield, field);
			});
		}
		break;
	case 'googlemap':
		if (fobj.Display !== null) {
			cfield.set('Zoom', {
				value: row.get(fobj.Zoom),
				field: fobj.Zoom
			});
			cfield.set('Display', row.get(fobj.Display));
			cfield.set('DisplayField', fobj.Display);
		}
		break;
	}
	return cfield;
}
export default {
	update(component) {
		const trytest = component.get('value').get('isLoaded') === true ? component.get('value') : component.get('value').get('content');
		let ComplexModel = [];
		trytest.forEach(function (row) {
			let CustomProperties = [];
			Object.keys(component.fields).forEach(function (field) {
				let data = row.get(field);
				let cfield = newCustomField(component, field, data,row);
				let Type = cfield.get('Type');
				let inherits = Type.split(':');
				if (inherits.length === 2) {
					Type = inherits[1];
					cfield.set('Type', inherits[0]);
				}
				if(component.fields[field].Source!==undefined){
					cfield.set('related',component.get('dependants')[field]);
				}
				cfield = TypeAdjustments(component, Type, field, data, cfield, row);
				CustomProperties[field] = cfield;
				try {
					CustomProperties.pushObject(cfield);
				} catch (e) {
					CustomProperties.push(cfield);
				}
			});
			CustomProperties.RoutedRecord = row;
			try {
				ComplexModel.pushObject(CustomProperties);
			} catch (e) {
				ComplexModel.push(CustomProperties);
			}
		});
		component.set('ComplexModel', ComplexModel);
	}
};
