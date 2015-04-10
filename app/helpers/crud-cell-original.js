import Ember from "ember";
import CT from '../templates/spinner';
function mapit(id,latlng) {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById(id), mapOptions);
}

export default Ember.Handlebars.makeBoundHelper(function (cell, options) {
    if (cell == null) {
        return "";
    }
    switch (cell.Type) {
    case 'image':
        return new Ember.Handlebars.SafeString('<img src="' + cell.Value + '"/>');
    case 'default':
        return cell.Value;
    case 'custom':
            return new Ember.Handlebars.SafeString(cell.inlineTemplate(cell.Value));
    case 'googlemap':
            //setTimeout(function(){
            //    mapit('map_'+cell.Field,cell.Value);
            //},1000);
            return new Ember.Handlebars.compile('spinner');
            return CT.build();
            var url = Ember.Handlebars.Utils.escapeExpression('{{action internal_map this}}');
            return new Ember.Handlebars.compile( '<a '+url+' >'+cell.Value+'</a>');
    }


});
