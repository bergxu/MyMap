
    document.addEventListener("deviceready", onDeviceReady, false);

    //the function runs when ths device is ready
    //
    function onDeviceReady() {
        locationAddress = null; //get my address when get my location
        var options = {
                zoom : 14,
                mapTypeId : google.maps.MapTypeId.ROADMAP
            };
        map = new google.maps.Map(document.getElementById("testMap"), options);

        //get my position
        var cb = function(position){
            var cb = function(address){
                    $("#searchInput").val(address);
                    locationAddress = address;
            };
            tools.codeLatlngToAddress(position, cb);
        };
        getMyPosition(cb);
    }

    //get current position
    //
    function getMyPosition(callback){
        var myPosition;
        if(navigator.geolocation){
            window.navigator.geolocation.watchPosition(function(position){
                //get my position
                myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(myPosition);
                drawMap(myPosition);
                callback(myPosition);
            }, function(){
                alert("error position");
            });
        }
    }

    //draw a map
    //
    function drawMap(latlng){ 
        var cb = function(address){
            locationAddress =address;
            var myMarker = new google.maps.Marker({
                icon:"http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                position : latlng,
                map : map
            });
            markersArray.push(myMarker);
            var infoWindow = new google.maps.InfoWindow({
                content : address
            });
            google.maps.event.addListener(myMarker, "click", function () { 
                infoWindow.open(map, myMarker);
             });

        } 
        tools.codeLatlngToAddress(latlng, cb);       
    }

    var tools = {
       //change LatLng to address
       //
       //long time
       function codeLatlngToAddress(latlng, callback){
            var address;
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': latlng}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                  address = results[0].formatted_address;
                  callback(address);
                }
              } else {
                  callback(address);
              }
            });
        
       }

        //change address to latlng
        //
        function codeAddressToLatlng(address,callback){
            var geoCoder = new google.maps.Geocoder();
            var latlng;
            geoCoder.geocode({"address":address}, function(results, status){
                if(status == google.maps.GeocoderStatus.OK){
                   latlng=  results[0].geometry.location;
                   callback(latlng);
                }
                else {
                   callback(latlng);
                    //alert("invalid input address");
                }
            });
        }
    }


