var map;
// initialization of markrs and and largeInfoWindow
var markers = [];
var largeInfowindow;

function ViewModel()
{
    initMap();

    //connecting  searched Data  and list of cafe using Knockout text input binding.
    this.searchedData = ko.observable("");
    var self = this;

    this.cafeBangalore = ko.computed(function() {
        var result = [];
        markers.forEach(function(marker) {
            if (marker.title.toLowerCase().includes(
                self.searchedData().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }

        });

        return result;
    }, this);
}

// create infoWindow and mapping it to marker 
function createInfowindow() {
    marker = this;
    infowindow = largeInfowindow;

    // bounce when show info window
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // set BOUNCE animation timeout (one bounce 700ms, only few bounces)
    setTimeout(function() {
        self.marker.setAnimation(null);
    }, 1400);

    setFoursquareContent(infowindow);

    infowindow.marker = marker;
    infowindow.open(map, marker);

    // clear marker and remove animation
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        marker.setAnimation(null);
    });
}

// fill info window with cafe's information featched from Foursquare
function setFoursquareContent(infowindow) {
    clientID = "2MEKJDAHYGI0LLMMRIT5XEOTXWNQDBWI4ZGG0I5KDQ0PEYAS";
    clientSecret = "1L4LKGPHN4XMD1PMIKPO5CESQRVN4CRDDXBCJZ2TWAFFVSQQ";

    var url = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' +
        marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title;

    // fetch data from Foursquare
    $.getJSON(url).done(function(marker) {
        response = marker.response.venues[0];

        // parse Foursquare response
        var name = response.name || 'no name found';
        var street = response.location.formattedAddress[0];
        var city = response.location.formattedAddress[1];
        var country = response.location.country || 'no country found';
        var category = response.categories[0].name;
        var url = response.url || '';
        var visitors = response.hereNow.summary || 'no visitors found';

        // format content for the info window
        content =
            '<h6>' + name + '</h6><p><i>' + category + '</i></p>' + 
            '<p>' + street + ', ' + city + ', ' + country + '</p>' +
            '<p> Visitors now: "' + visitors + '"</p>' + 
            '<p><a href="' + url + '">' + url + '</a></p>';
        infowindow.setContent(content);

    }).fail(function(e) {
        console.log(e.responseText);

        // notify user about errors
        infowindow.setContent('<h6>Error occured during retrieving data from Foursquare!</h6>');
    });
}

//function to change colour of marker icon.
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// create a cafe marker from our cafeBangalore[] data
var Cafe = function(cafe) {
    this.title = cafe.title;
    this.type = cafe.type;

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('bb603e');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    var point = new google.maps.LatLng(cafe.lat, cafe.long);
    var marker = new google.maps.Marker({
        position: point,
        title: cafe.title,
        map: map,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP
    });

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
       this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    this.marker = marker;

    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };

    this.marker.addListener('click', createInfowindow);

    // trigger click event to show info window
    this.showInfo = function() {
        google.maps.event.trigger(this.marker, 'click');
    };

};

// create map and initialize it with markers
function initMap() {
    // setting map to center of Bangalore 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 12.971599, lng: 77.594563},
        zoom: 13
    });

    // set styles for map using mapStyles[]
    map.setOptions({styles: mapStyles});

    // create info window
    largeInfowindow = new google.maps.InfoWindow();

    // add markers from cafesData.js file
    for (var i = 0; i < cafeBangalore.length; i++) {
        markers.push(new Cafe(cafeBangalore[i]));
    }
}


function mapLoadError() {
    $('#map').html('Error while loading Google maps');
}


// initialize view model
function initApp() {
    ko.applyBindings(new ViewModel());
}

