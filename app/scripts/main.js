$(function(){

  function getForecast(zip) {

    if (zip) {
      getWeatherData("zip", {zip: zip});
      return false;
    } else if (!navigator.geolocation){
      console.log("we don't have geo location");
      showZipInput()
      return false;
    }

    function success(position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;
      console.log(latitude + " " + longitude)
      getWeatherData("coordinates", {"latitude": latitude, "longitude": longitude});
      showLocationInfo();
    };

    function error() {
      console.log("geo location error or blocked");
      showZipInput()
      return false;
    };

    navigator.geolocation.getCurrentPosition(success, error);

  }

  function getWeatherData(locationMethod, locationData) {

    // set default API params
    function APIParams() {
        this.appid = "91e1db0bd8f7a77a2c6e3d7f4e34b73b";
        this.units = "imperial";
    }
    var currentWeatherAPIParams = new APIParams(); // for calling http://openweathermap.org/current
    var forecastWeatherAPIParams = new APIParams(); // for calling http://openweathermap.org/forecast5
    forecastWeatherAPIParams.cnt = 8; // because we need all of the 3 hr blocks for the current day
    // set location query params based on location method
    if (locationMethod === "coordinates") {
      currentWeatherAPIParams.lat = locationData.latitude;
      currentWeatherAPIParams.lon = locationData.longitude;
      forecastWeatherAPIParams.lat = locationData.latitude;
      forecastWeatherAPIParams.lon = locationData.longitude;
    } else if (locationMethod === "zip") {
      currentWeatherAPIParams.zip = locationData.zip;
      forecastWeatherAPIParams.zip = locationData.zip;
    }
    console.log(currentWeatherAPIParams);
    // cache the api response with the current weather conditions
    var theWeatherNow = $.getJSON("http://api.openweathermap.org/data/2.5/weather", currentWeatherAPIParams);
    // cache the api response with the whole day's weather
    var theWeatherToday = $.getJSON("http://api.openweathermap.org/data/2.5/forecast", forecastWeatherAPIParams);

    $.when(theWeatherNow, theWeatherToday).done(function(current, forecast) {
      if (current[0].cod != "200" || forecast[0].cod != "200") {
        console.log("unable to communicate with open weather map api: " + current.cod);
        showZipInput()
        return false;
      }
      console.log(current[0]);
      console.log(forecast[0]);
      var cityName = current[0].name;
      var currentTemp = parseInt(current[0].main.temp);
      var currentCondition = current[0].weather[0].description;
      var hourlyForecasts = forecast[0].list;

      populateForecast(cityName, currentTemp, currentCondition, hourlyForecasts);
      showLocationInfo();
    });

  }

  function populateForecast(cityName, currentTemp, currentCondition, hourlyForecasts) {
    // update markup with data from open weather api json response
    $('#city').text(cityName);
    $('#current-temp').text(currentTemp);
    $('#current-conditions').text(currentCondition);
    $( "#forecast-temps td" ).each(function(i) {
      $(this).text(parseInt(hourlyForecasts[i].main.temp));
    });
    $( "#forecast-icons td span" ).each(function(i) {
      var apicon = hourlyForecasts[i].weather[0].icon;
      switch (apicon) {
        case "01d":
          apicon = "B";
          break;
        case "01n":
          apicon = "C";
          break;
        case "02d":
          apicon = "H";
          break;
        case "02n":
          apicon = "I";
          break;
        case "03d":
          apicon = "N";
          break;
        case "03n":
          apicon = "N";
          break;
        case "04d":
          apicon = "Y";
          break;
        case "04n":
          apicon = "Y";
          break;
        case "09d":
          apicon = "Q";
          break;
        case "09n":
          apicon = "Q";
          break;
        case "10d":
          apicon = "R";
          break;
        case "10n":
          apicon = "R";
          break;
        case "11d":
          apicon = "0";
          break;
        case "11n":
          apicon = "0";
          break;
        case "13d":
          apicon = "W";
          break;
        case "13n":
          apicon = "W";
          break;
        case "50d":
          apicon = "J";
          break;
        case "50n":
          apicon = "K";
          break;
      }
      $(this).attr("data-icon", apicon);
    });
    $('#updated').text(new Date());
  }


  function showZipInput() {
    // show input where user can enter their zip code to get the forecast
    $('#location-found').hide();
    $('#location-needed').show();
  }

  function showLocationInfo() {
    // show input where user can enter their zip code to get the forecast
    $('#location-needed').hide();
    $('#location-found').show();
  }

  $('#location-wrong').on("click", function(e) {
    e.preventDefault();
    showZipInput();
  })

  $('#location-needed form').submit(function(e) {
    e.preventDefault();
    // this should be done only if zip is valid:
    getForecast($('#zip').val());
  });

  $("#sms-form").validate({
      rules: {
        phone: {
          required: true,
          phoneUS: true
        }
      },
      messages: {
        phone: {
          required: "We need your phone number to send you SMS alerts",
          phoneUS: "Please enter a valid U.S. phone number"
        }
      },
      submitHandler: function(form, e) {
        e.preventDefault();
        console.log($('#phone').val());
      }
    });


  getForecast();
});


