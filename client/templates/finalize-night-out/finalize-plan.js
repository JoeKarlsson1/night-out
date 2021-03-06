var finalTargets;
var MAP_ZOOM = 13;
var results;

Template.finalizePlan.helpers({
  getAllFinalTargets : function () {
    finalTargets = this.finalLaunches;
    return Session.set('selectedLaunches', finalTargets);
  }
});


//Pull latitude and longitude from google maps api and return location zoom
Template.finalizePlan.helpers({
  //If there is an error finding the current users geoloaction - spit out error to the DOM
  geolocationError : function() {
    var error = Geolocation.error();
    return error && error.message;
  },

  //Set out map options
  mapOptions : function() {
    var latLng = Geolocation.latLng();

    //Initialize the map once we  have the latLng.
    if (GoogleMaps.loaded() && latLng) {
      return {
        center : new google.maps.LatLng(latLng.lat, latLng.lng),
        zoom : MAP_ZOOM,

        // This is where you would paste any style found on Snazzy Maps.
        styles : [{ 'featureType' :'all','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'administrative','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'administrative.country','elementType' :'geometry.stroke','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'administrative.province','elementType' :'geometry.stroke','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'landscape','elementType' :'geometry','stylers' :[{ 'visibility' :'on' },{ 'color' :'#e3e3e3' }] },{ 'featureType' :'landscape','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'landscape.man_made','elementType' :'geometry.fill','stylers' :[{ 'saturation' :'0' },{ 'lightness' :'6' },{ 'weight' :'0.90' }] },{ 'featureType' :'landscape.man_made','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'landscape.natural','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi','elementType' :'all','stylers' :[{ 'visibility' :'off' },{ 'lightness' :'0' }] },{ 'featureType' :'poi','elementType' :'geometry.fill','stylers' :[{ 'visibility' :'simplified' }] },{ 'featureType' :'poi','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.attraction','elementType' :'all','stylers' :[{ 'visibility' :'simplified' }] },{ 'featureType' :'poi.attraction','elementType' :'geometry','stylers' :[{ 'visibility' :'simplified' }] },{ 'featureType' :'poi.attraction','elementType' :'geometry.fill','stylers' :[{ 'visibility' :'simplified' }] },{ 'featureType' :'poi.attraction','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.business','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.business','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.government','elementType' :'all','stylers' :[{ 'visibility' :'simplified' }] },{ 'featureType' :'poi.government','elementType' :'geometry','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.government','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.medical','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.park','elementType' :'geometry.fill','stylers' :[{ 'visibility' :'on' },{ 'color' :'#e6f0d7' }] },{ 'featureType' :'poi.place_of_worship','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.school','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'poi.sports_complex','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'road','elementType' :'all','stylers' :[{ 'color' :'#cccccc' }] },{ 'featureType' :'road','elementType' :'geometry','stylers' :[{ 'visibility' :'on' }] },{ 'featureType' :'road','elementType' :'geometry.fill','stylers' :[{ 'saturation' :'0' },{ 'lightness' :'30' }] },{ 'featureType' :'road','elementType' :'geometry.stroke','stylers' :[{ 'visibility' :'on' }] },{ 'featureType' :'road','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit','elementType' :'labels.icon','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit.line','elementType' :'geometry','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit.line','elementType' :'labels.text','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit.station','elementType' :'all','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit.station.airport','elementType' :'geometry','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'transit.station.airport','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] },{ 'featureType' :'water','elementType' :'geometry','stylers' :[{ 'color' :'#FFFFFF' }] },{ 'featureType' :'water','elementType' :'geometry.fill','stylers' :[{ 'lightness' :'-28' },{ 'saturation' :'33' },{ 'color' :'#f2f8fd' }] },{ 'featureType' :'water','elementType' :'labels','stylers' :[{ 'visibility' :'off' }] }]

      };
    }
  },
  allTargets : function () {
    //console.log(Session.get('allTargets'));
    return Session.get('allTargets');
  }
});

//Create google maps marker for current location
Template.finalizePlan.onCreated(function() {
  var self = this;

  GoogleMaps.ready('map', function(map) {
    //get lat and long from current location
    var latLng = Geolocation.latLng();

    //console.log('latlng', latLng);

    //variable within scope that sets current location
    var currentPost = new google.maps.LatLng(latLng.lat, latLng.lng);

    //variable that creates a new instance of marker information display
    var infowindow = new google.maps.InfoWindow();

    //Gold star SVG to mark current location
    var goldStar = {
    path : 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
    fillColor : 'yellow',
    fillOpacity : 0.8,
    scale : .25,
    strokeColor : 'gold',
    strokeWeight : 5
  };

    //drop marker on current location
    var marker = new google.maps.Marker({
      position : currentPost,
      map : map.instance,
      icon : goldStar,
      animation : google.maps.Animation.DROP
    });

    setMarkers(finalTargets);

    function setMarkers(places) {
      for (var i = 0; i < places.length; i++) {
        console.log('places', places[i]);
        createMarker(places[i]);
      }
    }

    //create marker for all restaurant locations within radius
    function createMarker(place) {

      var placeLoc = {
        lat : place.location.G,
        lng : place.location.K
      };

      //console.log('placeLoc', placeLoc);
      var marker = new google.maps.Marker({
        map : map.instance,
        position : placeLoc,
        draggable : false,
        animation : google.maps.Animation.DROP
      });

      var infoWindowContent =
        '<h3>' + place.name + '</h3><p> Votes: ' + place.votes + '</p>';

      //event listener that loads resturant information into infowindow.
      google.maps.event.addListener(marker, 'click', function() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        infowindow.setContent(infoWindowContent);
        infowindow.open(map.instance, this);
      });
      return marker;
    }
  });
});
