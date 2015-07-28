import ENV from '../config/environment';
export default {
  name: "google-api-for-crudtable",
	initialize: function(instance) {
		if (ENV['ember-cli-crudtable']) {
			if (ENV['ember-cli-crudtable']['google-api-key']) {
				window.onload = function () {
					var script = document.createElement("script");
					script.type = "text/javascript";
					script.src = "http://maps.googleapis.com/maps/api/js?key=" + ENV['ember-cli-crudtable']['google-api-key'] + "&sensor=TRUE&callback=pront";
					document.body.appendChild(script);
				}
			}
		}
	}
};