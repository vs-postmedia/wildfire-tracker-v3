import React, { Component, Fragment } from 'react';
import CircleMap from '../CircleMap/CircleMap';
import SummaryBox from '../SummaryBox/SummaryBox';
import FireListing from '../FireListing/FireListing';
import './WildfireMap.css';


// let zoom = window.innerWidth > 400 ? 4.25 : 4;
// let center = window.innerWidth > 400 ? [51.5, -124] : [54, -125];
const zoom = 4;
const center = [55, -125];

export class WildfireTracker extends Component {
	map_options = {
		center: center,
		classField: 'FIRE_STATU',
		maxZoom: 10,
		minZoom: 3,
		zoom: zoom
	}

	render() {
		return (
			<Fragment>
				<h1>B.C. Wildfire Tracker</h1>

				<CircleMap
					center={this.map_options.center}
					circleMarkerClassField={this.map_options.classField}
					config={this.props.config}
					container="mapview"
					data={this.props.data}
					evacsAlerts={this.props.data_evacs}
					fireSmokeUrl={this.props.fireSmokeUrl}
					mapboxStyle={this.props.mapboxStyle}
					maxZoom={this.map_options.maxZoom}
					minZoom={this.map_options.minZoom}
					selectedFeature={this.props.selectedFeature}
					zoom={this.map_options.zoom}>
				</CircleMap>

				<SummaryBox
					data={this.props.data_all}
					toggleFireTypeHandler={this.props.toggleFireTypeHandler}>
				</SummaryBox>

				<FireListing
					data={this.props.data_fon}
					flyToLocation={this.props.flyToLocation}>
				</FireListing>
			</Fragment>
		);
	}
}


export default WildfireTracker;
