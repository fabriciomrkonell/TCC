<script>

'use strict';

var path = new google.maps.MVCArray(),
    service = new google.maps.DirectionsService(), poly;

function initialize() {
  var myOptions = {
    zoom: 13,
    center: new google.maps.LatLng(-26.494561, -49.1048534),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    disableDefaultUI: true,
    draggableCursor: "crosshair"
  }

  var map = new google.maps.Map(document.getElementById("map"), myOptions);
  poly = new google.maps.Polyline({ map: map });

  google.maps.event.addListener(map, "click", function(evt) {
    if (path.getLength() === 0) {
      path.push(evt.latLng);
      poly.setPath(path);
    } else {
      service.route({
        origin: path.getAt(path.getLength() - 1),
        destination: evt.latLng,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
            path.push(result.routes[0].overview_path[i]);
          }
        }
      });
    }
  });

}

google.maps.event.addDomListener(window, 'load', initialize);

</script>