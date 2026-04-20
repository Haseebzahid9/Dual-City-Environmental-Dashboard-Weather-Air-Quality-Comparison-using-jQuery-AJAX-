# Dual-City-Environmental-Dashboard-Weather-Air-Quality-Comparison-using-jQuery-AJAX-
A dynamic single-page web application that compares real-time weather and air quality data for two cities simultaneously using jQuery, AJAX, and JSON APIs.  This project demonstrates API integration, asynchronous data handling, and interactive UI design with features like temperature toggling, AQI-based UI changes, and historical search tracking.
Features
 Compare two cities simultaneously
 Chained AJAX requests:
Geocoding API → fetch latitude & longitude
Weather & Air Pollution APIs → fetch real-time data
 JSON Parsing for:
Temperature
Humidity
PM2.5 (Air Quality)
 Error Handling
Bootstrap alerts using jQuery.fail()
 Temperature Toggle
Switch between Celsius & Fahrenheit
 Dynamic UI
Background changes based on AQI levels
 Weather Icons & Conditions Mapping
 Search History
Stored in localStorage for quick access
 (Bonus) 5-Day Forecast Graph using Chart.js
Smooth UI effects using fadeIn() & loaders Technologies Used
HTML5, CSS3
JavaScript (jQuery)
AJAX & JSON
Bootstrap
Chart.js
OpenWeatherMap API
 API Used
OpenWeatherMap:
Geocoding API
Current Weather API
Air Pollution API
Forecast API
 How to Run
Clone the repository
Add your OpenWeatherMap API key
Open index.html in browser
