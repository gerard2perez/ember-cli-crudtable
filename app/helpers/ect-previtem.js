import Ember from 'ember';

const getarrayindex = (params) => {
	if(params[0].length-1>0){
		return params[0][params[1]-1];
	}else{
		return {};
	}
};
export default Ember.Helper.helper(getarrayindex);
