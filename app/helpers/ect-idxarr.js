import Ember from 'ember';

const getarrayindex = (params) => params[0][params[1]]||"";
export default Ember.Helper.helper(getarrayindex);
