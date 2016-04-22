$(function(){

// call up the weather on page load

  getForecast();


// Weather-based functionality

  function getForecast(zip) {
    if (zip) {
      getWeatherData("zip", {zip: zip});
      showPopulatedMarkup();
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
      showPopulatedMarkup();
    });

  }

  function populateForecast(cityName, currentTemp, currentCondition, hourlyForecasts) {
    // update markup with data from open weather api json response
    $('#city span').text(cityName);
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
      $(this).attr({
        "data-icon": apicon,
        "title": hourlyForecasts[i].weather[0].description,
        "data-toggle": "tooltip",
        "data-placement": "bottom"
      });
      $(this).tooltip();
    });
    $('#updated').text(new Date());
  }

// dynamic elements

  function showZipInput() {
    // show input where user can enter their zip code to get the forecast
    $('#location-found').hide();
    $('.loading').hide();
    $('#location-needed').show();
  }

  function showPopulatedMarkup() {
    // show input where user can enter their zip code to get the forecast
    $('#location-needed').hide();
    $('.loading').hide();
    $('#location-found').show();
    $('#forecast > *:not(.loading)').show();
  }

  $('#location-wrong').on("click", function(e) {
    e.preventDefault();
    showZipInput();
  })


  // Forms, validation

  $("#location-needed form").validate({
      rules: {
        zip: {
          required: true,
          digits: true,
          minlength: 5,
          maxlength: 5
        }
      },
      messages: {
        zip: {
          required: "We need your zip code because geolocation is not available",
          minlength: "Please enter a valid zip code"
        }
      },
      submitHandler: function(form, e) {
        e.preventDefault();
        getForecast($('#zip').val());
      }
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
        TwilioSMS.sendMessage(
          $('#phone').val(), // Recipient's number
          '+19252939327', // Twilio account phone number
          'Hey There! Here\'s a top secret weathur.ly project for your eyes only: http://dev.to/rly?ref=producthunt',

          function ok() {
            alert("Message sent!");
          },
          function fail() {
            var letterFromTheEditor = `
We here at Weathur.ly are way to frugal to pay for an SMS service. If you want proof that we really could send an SMS if we wanted to, follow these steps:

1. Go to https://twilio.com/user/account/phone-numbers/verified
2. Log in with user: twilio@sean.sh and pw: beQM8s)3CxkB
3. Verify your phone number with Twilio
4. Come back to this website and try subscribing to SMS alerts one last time

We reccomend you remove your number from the demo account once you believe in us, what with the password being public and all.

Best,

-Weathur.ly Sr. Security Architect (Fmr)
`
            alert("Doh!\n" + letterFromTheEditor);
          }
        );
      }
    });



  // Twilio module a la https://bountify.co/twilio-javascript-sms-solution#answer_1567

  var TwilioSMS = (function($) {

    var accountSid = 'AC7ffe26c73bf5f7c9c837a75be2f5e499'; // replace with your account SID
    var authToken = '18dc027f4f4add343bd8a9f9dc927f9e'; // replace with your auth token

    var testEndpoint = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';
    var liveEndpoint = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';

    var sendMessage = function(to, from, body, successCallback, failCallback) {
      var data = {
        To: to,
        From: from,
        Body: body
      };

      $.ajax({
        method: 'POST',
        url: testEndpoint,
        //url: liveEndpoint, // uncomment this in production and comment the above line
        data: data,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded', // !
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization",
            "Basic " + btoa(accountSid + ":" + authToken) // !
          );
        },
        success: function(data) {
          console.log("Got response: %o", data);

          if (typeof successCallback == 'function')
            successCallback(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Request failed: " + textStatus + ", " + errorThrown);

          if (typeof failCallback == 'function')
            failCallback(jqXHR, textStatus, errorThrown);
        }
      });
    }

    return {
      sendMessage: sendMessage
    };

  })(jQuery);

});


