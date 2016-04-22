$(function(){

  function getForecast() {

    if (!navigator.geolocation){
      console.log("we don't have geo location");
      return false;
    }

    function success(position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;
      console.log(latitude + " " + longitude)
      // getWeatherByCoords(latitude, longitude)
    };

    function error() {
      console.log("geo location error or blocked");
      // triggerZipInput()
    };

    navigator.geolocation.getCurrentPosition(success, error);

  }

  getForecast();
});


