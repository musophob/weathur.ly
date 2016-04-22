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
      getWeatherByCoords(latitude, longitude)
    };

    function error() {
      console.log("geo location error or blocked");
      // triggerZipInput()
    };

    navigator.geolocation.getCurrentPosition(success, error);

  }

  function getWeatherByCoords(latitude, longitude) {

    // cache the api response with the current weather conditions
    var theWeatherNow = $.getJSON("http://api.openweathermap.org/data/2.5/weather", {
      appid: "91e1db0bd8f7a77a2c6e3d7f4e34b73b",
      lat: latitude,
      lon: longitude,
      units: "imperial"
    });
    // cache the api response with the whole day's weather
    var theWeatherForecast = $.getJSON("http://api.openweathermap.org/data/2.5/forecast", {
      appid: "91e1db0bd8f7a77a2c6e3d7f4e34b73b",
      lat: latitude,
      lon: longitude,
      units: "imperial",
      cnt: 8 // because we need all of the 3 hr blocks for the current day
    });

    $.when(theWeatherNow, theWeatherForecast).done(function(current, forecast) {
      if (current[0].cod != "200" || forecast[0].cod != "200") {
        console.log("unable to communicate with open weather map api: " + current.cod);
        // triggerZipInput()
        return false;
      }
      console.log(current[0]);
      console.log(forecast[0]);
      var cityName = current[0].name;
      var currentTemp = current[0].main.temp;
      var currentCondition = current[0].weather[0].description;
      var hourlyForecasts = forecast[0].list;

      // populateForecast();
    });

  }

  function getWeatherByZip(data) {
    // like `getWeatherByCoords()`, but with a zip code
  }

  function populateForecast(cityName, currentTemp, currentCondition, hourlyForecasts) {
    // update markup with data from open weather api json response
  }


  function triggerZipInput() {
    // create an input where user can enter their zip code to get the forecast
  }

  getForecast();
});


