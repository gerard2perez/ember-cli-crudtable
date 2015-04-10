window.pront=function (){
    console.log('API_Loaded');
}
export default {
    name: 'google-api-for-crudtable',
    initialize: function () {
        window.onload = function () {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyC119OLvAQ384atvy9yHCpHgT6n38Ie4dU&sensor=TRUE&callback=pront";
            document.body.appendChild(script);
        }
    }
};
