GetCurrentWeatherData()
GetForecastData()

function convertToWeekday(dayNumber) {

    let dayName;
    switch (dayNumber) {
        case 0:
            dayName = "Sunday";
            break;
        case 1:
            dayName = "Monday";
            break;
        case 2:
            dayName = "Tuesday";
            break;
        case 3:
            dayName = "Wednesday";
            break;
        case 4:
            dayName = "Thursday";
            break;
        case 5:
            dayName = "Friday";
            break;
        case  6:
            dayName = "Saturday";
    }
    return dayName;
}

function convertToMonth(monthNumber){

    let monthName;
    switch (monthNumber) {
        case 0:
            monthName = "January";
            break;
        case 1:
            monthName = "February";
            break;
        case 2:
            monthName = "March";
            break;
        case 3:
            monthName = "April";
            break;
        case 4:
            monthName = "May";
            break;
        case 5:
            monthName = "June";
            break;
        case 6:
            monthName = "July";
            break;
        case 7:
            monthName = "August";
            break;
        case 8:
            monthName = "September";
            break;
        case 9:
            monthName = "October";
            break;
        case 10:
            monthName = "November";
            break;
        case 11:
            monthName = "December";
            break;
    }
    return monthName;
}

async function GetCurrentWeatherData() {
    let weatherApi = await fetchData('https://api.openweathermap.org/data/2.5/weather?q=Stockholm,se&units=metric&APPID=030a58b09c02f547d5fb91d31800b695')

    let city = weatherApi.name;
    let temp = weatherApi.main.temp;
    let weatherTimeStamp = weatherApi.dt;
    let humidity = weatherApi.main.humidity;
    let windSpeed = weatherApi.wind.speed;
    let sunrise = weatherApi.sys.sunrise;
    let sunset = weatherApi.sys.sunset;

    //Gör om unix timestamp (som används i JSON) till ett datum
    let currentWeatherDate = new Date();
    currentWeatherDate.setTime(weatherTimeStamp * 1000);

    let sunriseTime = new Date();
    sunriseTime.setTime(sunrise * 1000);

    let sunsetTime = new Date();
    sunsetTime.setTime(sunset * 1000);

    //Gör så att klockslaget visas korrekt
    let currentWeatherMinutes = currentWeatherDate.getMinutes();
    if(currentWeatherMinutes < 10) {
      currentWeatherMinutes = "0" + currentWeatherMinutes;
    }
    let sunriseMinutes = sunriseTime.getMinutes();
    if(sunriseMinutes < 10) {
      sunriseMinutes = "0" + sunriseMinutes;
    }

    let sunsetMinutes = sunsetTime.getMinutes();
    if(sunsetMinutes < 10) {
      sunsetMinutes = "0" + sunsetMinutes;
    }

    //Ändrar ikonen för väderförhållande
    let icon = "weatherApi.weather[0].icon";
    let img = document.getElementById("weather-icon");

    switch (icon) {
        case "01d":
            img.src = 'images/sun.png';
            break;
        case "01n":
            img.src = 'images/moon.png';
            break;
        case "02d": case "02n":
            img.src = 'images/few-clouds.png';
            break;
        case "03d": case "03n": case "04d": case "04n":
            img.src = 'images/cloudy.png';
            break;
        case "09d": case "09n": case "10d": case "10n":
            img.src = 'images/rain.png';
            break;
        case "11d": case "11n":
            img.src = 'images/thunder.png';
            break;
        case "13d": case "13n":
            img.src = 'images/snow.png';
            break;
    }

    //Hämtar in alla element där information ska visas
    let currentCity = document.getElementById('city');
    let currentTemp = document.getElementById('current-temp');
    let currentDate = document.getElementById('current-date');
    let currentTime = document.getElementById('current-time');
    let currentHumidity = document.getElementById('humidity');
    let currentWind = document.getElementById('wind');
    let sunriseP = document.getElementById('sunrise');
    let sunsetP = document.getElementById('sunset');

    //Skriver ut informationen i elementen
    currentCity.innerHTML = "Weather in " + city;
    currentTemp.innerHTML = Math.round(temp * 10) / 10 + "°C";
    currentDate.innerHTML = convertToWeekday(currentWeatherDate.getDay()) + " " + currentWeatherDate.getDate() + " " + convertToMonth(currentWeatherDate.getMonth());
    currentTime.innerHTML = "Latest updated at " + currentWeatherDate.getHours() + ":" + currentWeatherMinutes;
    currentHumidity.innerHTML = humidity + "%";
    currentWind.innerHTML = windSpeed + " m/s";
    sunriseP.innerHTML = sunriseTime.getHours()  + ":" + sunriseMinutes;
    sunsetP.innerHTML = sunsetTime.getHours()  + ":" + sunsetMinutes;
}

async function GetForecastData() {
    let forecastApi = await fetchData('https://api.openweathermap.org/data/2.5/forecast?q=Stockholm,se&units=metric&APPID=030a58b09c02f547d5fb91d31800b695')

    let forecastList = forecastApi.list;
    let forecastTimeStamp = forecastApi.list[0].dt;

    /* Tar fram dagens datum och de 4 nästkommande dagarna, eller datum för
    de 5 nästkommande dagarna, beroende på när sidan visas (valde att göra detta
    då API:en knappt visar någon information om den femte dagen om sidan visas
    tidigt under dagen) */
    let forecastDate1 = new Date();
    forecastDate1.setTime(forecastTimeStamp * 1000);

    let forecastDate2 = new Date();
    forecastDate2.setDate(forecastDate1.getDate()+1);

    let forecastDate3 = new Date();
    forecastDate3.setDate(forecastDate1.getDate()+2);

    let forecastDate4 = new Date();
    forecastDate4.setDate(forecastDate1.getDate()+3);

    let forecastDate5 = new Date();
    forecastDate5.setDate(forecastDate1.getDate()+4);

    //Funktion för att hämta max och min temperatur för en dag
    function calculateMaxMinTemp(currentDay, currentMaxP, currentMinP) {

        let maxTemp;
        let minTemp;
        let currentMonth = currentDay.getMonth() + 1;
        let currentDate = currentDay.getDate();

        if (currentMonth <10) {
            currentMonth = "0" + currentMonth;
        }

        if (currentDate <10) {
            currentDate = "0" + currentDate;
        }

        for (let i = 0; i < forecastList.length; i++) {

            //Kollar att månaden och datumet stämmer överens med den nuvarande objektet i listan
            if (forecastList[i].dt_txt.slice(5, 7) == currentMonth && forecastList[i].dt_txt.slice(8, 10) == currentDate) {

                if (maxTemp == null || minTemp == null) {
                    maxTemp = forecastList[i].main.temp_min;
                    minTemp = forecastList[i].main.temp_min;
                }
                else {

                    if (forecastList[i].main.temp_max > maxTemp) {
                        maxTemp = forecastList[i].main.temp_max;
                    }

                    if (forecastList[i].main.temp_min < minTemp) {
                        minTemp = forecastList[i].main.temp_min;
                    }
                }
            }
        }

        maxTemp = Math.round(maxTemp * 10) / 10;
        minTemp = Math.round(minTemp * 10) / 10;

        let maxTempParagraph = document.getElementById(currentMaxP);
        maxTempParagraph.innerHTML = maxTemp + " °C";

        let minTempParagraph = document.getElementById(currentMinP);
        minTempParagraph.innerHTML = minTemp + "°C";
    }

    function getForecastIcon(currentDay, iconImg) {
        let currentMonth = currentDay.getMonth() + 1;
        let currentDate = currentDay.getDate();

        let icon = document.getElementById(iconImg);

        let cloudAmount = 0;
        let fewCloudsAmount = 0;
        let clearSkyAmount = 0;

        if (currentMonth <10) {
            currentMonth = "0" + currentMonth;
        }

        if (currentDate <10) {
            currentDate = "0" + currentDate;
        }

        for (let i = 0; i < forecastList.length; i++) {

            if (forecastList[i].dt_txt.slice(5, 7) == currentMonth && forecastList[i].dt_txt.slice(8, 10) == currentDate) {

                if (forecastApi.list[i].weather[0].icon === "09d" || forecastApi.list[i].weather[0].icon === "09n" || forecastApi.list[i].weather[0].icon === "10d" || forecastApi.list[i].weather[0].icon === "10n") {
                    icon.src = 'images/rain.png';
                    return false;
                }
                else if (forecastApi.list[i].weather[0].icon === "13d" || forecastApi.list[i].weather[0].icon === "13n") {
                    icon.src = 'images/snow.png';
                    return false;
                }
                else if (forecastApi.list[i].weather[0].icon === "11d" || forecastApi.list[i].weather[0].icon === "11n") {
                    icon.src = 'images/thunder.png';
                    return false;
                }
                else {

                    if (forecastApi.list[i].weather[0].icon === "03d" || forecastApi.list[i].weather[0].icon === "03n" || forecastApi.list[i].weather[0].icon === "04d" || forecastApi.list[i].weather[0].icon === "04n") {
                        cloudAmount += 1;
                    }
                    else if (forecastApi.list[i].weather[0].icon === "02d" || forecastApi.list[i].weather[0].icon === "02n") {
                        fewCloudsAmount += 1;
                    }
                    else if (forecastApi.list[i].weather[0].icon === "01d" || forecastApi.list[i].weather[0].icon === "01n") {
                        clearSkyAmount += 1;
                    }
                }
            }
        }

        if (cloudAmount > fewCloudsAmount && cloudAmount > clearSkyAmount) {
            icon.src = 'images/cloudy.png';
        }
        else if (fewCloudsAmount > cloudAmount && fewCloudsAmount > clearSkyAmount) {
            icon.src = 'images/few-clouds.png';
        }
        else {
            icon.src = 'images/sun.png';
        }
    }

    let day1 = document.getElementById('day1');
    let day2 = document.getElementById('day2');
    let day3 = document.getElementById('day3');
    let day4 = document.getElementById('day4');
    let day5 = document.getElementById('day5');

    day1.innerHTML = convertToWeekday(forecastDate1.getDay()) + "<br>" + forecastDate1.getDate() + " " + convertToMonth(forecastDate1.getMonth());
    day2.innerHTML = convertToWeekday(forecastDate2.getDay()) + "<br>" + forecastDate2.getDate() + " " + convertToMonth(forecastDate2.getMonth());
    day3.innerHTML = convertToWeekday(forecastDate3.getDay()) + "<br>" + forecastDate3.getDate() + " " + convertToMonth(forecastDate3.getMonth());
    day4.innerHTML = convertToWeekday(forecastDate4.getDay()) + "<br>" + forecastDate4.getDate() + " " + convertToMonth(forecastDate4.getMonth());
    day5.innerHTML = convertToWeekday(forecastDate5.getDay()) + "<br>" + forecastDate5.getDate() + " " + convertToMonth(forecastDate5.getMonth());

    calculateMaxMinTemp(forecastDate1, 'max-temp1', 'min-temp1');
    calculateMaxMinTemp(forecastDate2, 'max-temp2', 'min-temp2');
    calculateMaxMinTemp(forecastDate3, 'max-temp3', 'min-temp3');
    calculateMaxMinTemp(forecastDate4, 'max-temp4', 'min-temp4');
    calculateMaxMinTemp(forecastDate5, 'max-temp5', 'min-temp5');

    getForecastIcon(forecastDate1, 'forecast-icon1');
    getForecastIcon(forecastDate2, 'forecast-icon2');
    getForecastIcon(forecastDate3, 'forecast-icon3');
    getForecastIcon(forecastDate4, 'forecast-icon4');
    getForecastIcon(forecastDate5, 'forecast-icon5');

}

async function fetchData(url) {

    let promise = await fetch(url);
    let data = await promise.json();
    return data;
}
