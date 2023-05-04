import React from 'react';
import WildfireTracker from '../WildfireTracker/WildfireTracker';
import './App.css';
import mapboxConfig from '../../data/mapbox-config';


// Wildfires url
const currentFiresURL = 'https://raw.githubusercontent.com/vs-postmedia/bc-wildfire-scraper/master/data/wildfires.json';
// Fire perimeters
// const firePerimeters = 'https://vs-postmedia-data.sfo2.digitaloceanspaces.com/wildfires/perimeters.json';
// evacuation order & alert perimeters
const evacsAlertsUrl = 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?f=pgeojson&where=1=1&outFields=ORDER_ALERT_STATUS,SHAPE__AREA,EVENT_TYPE';
// firesmoke png file
const fireSmokeUrl = 'https://vs-postmedia-data.sfo2.digitaloceanspaces.com/wildfires/fire-smoke-max.png';

// map tiles & attribution
const mapboxStyle = 'https://api.maptiler.com/maps/outdoor/style.json?key=pRmETZ6APJE6l5kAzesF';


function App() {
	return (
		<WildfireTracker
			currentData={currentFiresURL}
			evacsAlertsUrl={evacsAlertsUrl}
			fireSmokeUrl={fireSmokeUrl}
			// firePerimeters={firePerimeters}
			mapboxConfig={mapboxConfig}
			mapboxStyle={mapboxStyle}>
		</WildfireTracker>
	);
}

export default App;
