
    var selectedLocation;
    var selectedAddress;
    var markersArray = new Array(); // the array of all the map markers to delete it 
    var searchName = new Array(); // the array of the account name in the maplist
    var searchAddress = new Array(); // the array of the  account address in the maplist
    var locationFlag = true; // flag of the search input and my position
    var listData;
    var map;
    var newLocation;

    document.addEventListener("deviceready", onDeviceReady, false);

    document.addEventListener("backbutton", function(){

        if(confirm('Are you sure exit?')){
            navigator.app.exitApp();
        } 
                   

    }, false);

    //the function runs when ths device is ready
    //
    function onDeviceReady(){
      
        initialize();
        //get my position
        var cb = function(position){
            selectedLocation = position;// Now My Posistion
            newLocation = selectedLocation;// the position will change by the change button
            var cb = function(address){
                    selectedAddress = address;
                    $("#locationText").html(address);
                    $("#searchInput").val(address);
            };
            codeLatlngToAddress(position, cb);
        };
        getMyPosition(cb);
               
    }

    function initialize(){
        var options = {
                zoom : 14,
                mapTypeId : google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false
            };
        map = new google.maps.Map(document.getElementById("testMap"), options);
    }

    //get current position
    //
    function getMyPosition(callback){
        var pos;
        if(navigator.geolocation){
            window.navigator.geolocation.watchPosition(function(position){
                //get my position
                pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(pos);
                drawMap(pos);
                callback(pos);
            }, function(){
                alert("error position");
            });
        }else{
            alert("something wrong");
        }
    }

    //clear markers
    //
    function clearOverlays() {
      for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
      }
      markersArray = [];
    }

    //draw a map
    //
    function drawMap(latlng){ 
        var cb = function(address){
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

        };
        codeLatlngToAddress(latlng, cb);       
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
        return latlng;
    }

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

   //draw other locations
   //
   function drawOtherLocation(mylocation){
        var lat = mylocation.lat();
        var lng = mylocation.lng();
        var boundsArray = new Array();
        var bounds = new google.maps.LatLngBounds();
        boundsArray.push(mylocation); 
        var distance = parseInt($("#distanceSelect").val());
        var cb = function(datas){
            listData = datas;
            datas.forEach(function(data){
                var latLng = new google.maps.LatLng(data.Location__Latitude__s, data.Location__Longitude__s);
                boundsArray.push(latLng);
                var cb = function(address){
                    //map.setCenter(mylocation);
                    var myMarker = new google.maps.Marker({
                        icon:"http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        position : latLng,
                        map : map
                    });
                    var infoWindow = new google.maps.InfoWindow({
                        content : address
                    });
                    markersArray.push(myMarker);
                    google.maps.event.addListener(myMarker, "click", function () { 
                        infoWindow.open(map, myMarker);
                    });
                    
                };
                codeLatlngToAddress(latLng, cb);
            });
            boundsArray.forEach(function(place){
                bounds.extend(place);
            });
            map.fitBounds(bounds); 
            if(listData.length === 0){
                map.setZoom(14);
            }        
        };
        findAccounts(lat, lng, distance, cb);
   }

   //find the account by distance
   //
   function findAccounts(lat, lng, distance, callback){
        var myData = {
            "accountId" : "001M000000XHHze",
            "lat": lat + "",
            "lng": lng + "",
            "distanceUnit": "km",
            "distance": distance + ""
        };
        $.ajax({
            //url : "https://shdemoapp.secure.force.com/services/apexrest/listNearbyAccounts/v1/",
            url: "https:/dev-saf.cs7.force.com/services/apexrest/listNearbyAccounts/v1/",
            type : "POST",
            data : JSON.stringify(myData),
            dataType : "json",
            contentType:"application/json; charset=utf-8",
            success:function(data){
                callback(data);
            },
            error:function(error){
                alert("error");
            }
       });
   }

   //exchange the position 
   //
   function exchangePostion(){
        locationFlag = !locationFlag;
        if(!locationFlag){
            $("#searchInput").removeClass("hideInput").removeAttr("disabled").val("");
        }
        else{
            $("#searchInput").val(selectedAddress).addClass("hideInput").attr("disabled");
        }

   }
   // search button 
   //
   function searchSubmit(){  
       collapseTools();
       clearOverlays();
       var tempBounds = new google.maps.LatLngBounds();
       tempBounds.extend(newLocation);
       var distance =  parseInt($("#distanceSelect").val());
        var cb = function(latlng){
            if(!locationFlag){      
                newLocation = latlng;
            }
            else{
                newLocation = selectedLocation;
            }
            drawMap(newLocation);
            if(distance > 0){
                drawOtherLocation(newLocation); 
            }else if(distance === 0){
                map.fitBounds(tempBounds);
                map.setCenter(newLocation);
                map.setZoom(14);
            }       
         };
        codeAddressToLatlng($("#searchInput").val(), cb); 
        $("#locationText").html($("#searchInput").val());
        searchName = [];
        searchAddress = [];
   }
   
   //show map
   //
   function showMap(){
        collapseTools();
        $("#testMapList").hide();
        $("#testMap").show();
        google.maps.event.trigger(map, 'resize');
        $("#listBtn").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
        $("#mapBtn").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
        
   }

   //show map list
   //
   function showMapList(){
        collapseTools();
        myScroll = new IScroll('#testMapList');
        $("#mapBtn").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
        $("#listBtn").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
        $("#testMap").hide();
        $("#testMapList").show();
        startLoad();

        var distance = parseInt($("#distanceSelect").val());
        if(searchName.length === 0 || searchAddress.length === 0){
            $("#mapList").empty();
            if(listData.length === 0 || !listData){  
                spinner.spin(document.getElementById("testMapList"));                  
                setTimeout(function(){
                    spinner.stop();
                    alert("No Data Found");
                },1000);
            }
            var i = 1;
            listData.forEach(function(data){
                var latLng = new google.maps.LatLng(data.Location__Latitude__s, data.Location__Longitude__s);
                var cb = function(address){
                   $("#mapList").append("<li style='margin-bottom:20px;background:white;width:100%;border:1px solid gray;padding:5px;'>"+
                                        "<div style='font-size:18px;'>"+ i +" . " + data.Name +"</div>"+
                                        "<div style='margin-top:5px;font-size:16px;'><img src='img/home_icon.png'>&nbsp;"+ address +"</div>"+
                                        "<div style='margin:5px; border-bottom: 1px solid gray; height: 2px; '></div>"+
                                        "<div style='margin-top:5px;padding:3px;'><a class='btn btn-default' style='width:100%;text-align: left;font-size:15px; href='tel:"+ data.Phone +"'><img src='img/phone_icon.png'>&nbsp; "+ data.Phone +"</a></div>"+
                                        "</li>");
                    myScroll.refresh();
                    searchName.push(data.Name);
                    searchAddress.push(address);
                    i++;
                };
                codeLatlngToAddress(latLng, cb);
            });
            listData = null;
        }

   }

   //icon change
   //
   function collapseTools(){
            if($("#myself").hasClass("collapsed")){
                $("#iconId").find("img").attr("src","img/arrowed_up.png");
                $("#locationIcon").hide();
                $("#locationText").hide();
                $("#menuTool").css("z-index","100");
                $("#scroller").css("z-index","0");
                
            }else{        
                
                $("#locationIcon").show();
                $("#locationText").show();
                $("#iconId").find("img").attr("src","img/arrowed_down.png");
                $("#menuTool").css("z-index","-1");
                $("#scroller").css("z-index","1");
            }
    }

    //loading icon
    //
    function startLoad(target){
        var opts = {  
          lines: 13,   
          length: 20,  
          width: 10, 
          radius: 30, 
          corners: 1,  
          rotate: 0, 
          direction: 1,  
          color: "#000",   
          speed: 1, 
          trail: 60,  
          shadow: false,   
          hwaccel: false,   
          className: "spinner", 
          zIndex: 2e9, 
          top: "auto", 
          left: "auto" 
        };   
        spinner = new Spinner(opts); 
    }
