import React, { Fragment, Component } from 'react';
import maplibregl from 'maplibre-gl';
import WildfireTooltip from '../WildfireTooltip/WildfireTooltip';

// CSS
import './maplibre-gl.css';
import './CircleMap.css';

import legend from '../../images/firesmoke-legend-v2.png';

// VARS
const evacColor = '#E35D42';
const alertColor = '#A7A9AB';
// const alertColor = '#F6B31C';
const evacZoomLevel = 6;
const evacMinSize = 220000000;

export class CircleMap extends Component {
	map;
	state = {};
	// prep the popup
	popup = new maplibregl.Popup({
		closeButton: false,
		closeOnClick: true
	});

	constructor(props) {
		super(props);

		// bind popup to main component
		this.showPopup = this.showPopup.bind(this);
		this.hidePopup = this.hidePopup.bind(this);
	}

	addEvacsAlerts(evacsAlerts, firstSymbolId) {
		// add arcgis source
		this.map.addSource('evacs_alerts_arcgis', {
        	type: 'geojson',
        	data: evacsAlerts
      	});
		// add & style layer
      	this.map.addLayer({
      	  id: 'evacs_alerts_layer',
      	  type: 'fill',
      	  source: 'evacs_alerts_arcgis',
      	  filter: ['==', ['get', 'EVENT_TYPE'], 'Fire'],
      	  paint: {
      	    'fill-color': [
      	      'match',
      	      ['get', 'ORDER_ALERT_STATUS'],
      	      'Alert',
      	      alertColor,
      	      'Order',
      	      evacColor,
      	      'Tactical',
      	      '#A7A9AB',
      	      '#A7A9AB'
      	    ],
      	    'fill-opacity': 0.7
      	  }
      	// place layer underneath this layer
      	}, firstSymbolId);		

		// evac/alert labels
		this.map.addLayer({
			id: 'evac-data-text',
			minzoom: evacZoomLevel,
			source: 'evacs_alerts_arcgis',
			type: 'symbol',
			// we don't need to label every single evac zone...
			filter: ['>', ['get', 'Shape__Area'], evacMinSize],
			layout: {
				'symbol-placement': 'point',
				'text-field': [
					'format',
					['concat', 'Evacuation ', ['get', 'ORDER_ALERT_STATUS']],
					{
						'font-scale': 0.9,
						'font-weight': 800
					}
				],
			},
			paint: {
				'text-color': 'rgba(255,255,255,1)',
				'text-halo-blur': .25,
				'text-halo-color': [
					'match',
					['get', 'ORDER_ALERT_STATUS'],
					'Alert',
					alertColor,
					'Order',
					evacColor,
					'Tactical',
					'#A7A9AB',
					'#A7A9AB' // fallback
				],
				'text-halo-width': 1
			}
		});
	}

	addFiresmokeLayer(fireSmokeUrl, firstSymbolId) {
		// firesmoke
		this.map.addSource('fire-smoke', {
			type: 'image',
			url: fireSmokeUrl,
			coordinates: [
				[-160,70],
				[-52,70],
				[ -52,32],
				[-160,32]
			]
		});
		this.map.addLayer({
			id: 'fire-smoke',
			source: 'fire-smoke',
			type: 'raster',
			paint: {
				'raster-opacity': 0.6
			}
		// place layer underneath this layer
		}, firstSymbolId);

		// add legend
		this.addFiresmokeLegend();
	}

	addFiresmokeLegend() {

	}

	addWildfireLayer(data, firstSymbolId) {
		this.map.addSource('wildfires', {
			type: 'geojson',
			data: data
		});
		this.map.addLayer({
			id: 'wildfires',
			type: 'circle',
			source: 'wildfires',
			paint: {
				'circle-color': [
					'match',
					['get', 'STATUS'],
					'New',
					'#DD2D25',
					'Out of Control',
					'#DD2D25',
					'Being Held',
					'#F26B21',
					'Under Control',
					'#0062A3',
					'Out',
					'#6D6E70',
					/* fallback */ '#9b3f86'
				],
				'circle-opacity': 0.7,
				// probably a better way to do this...
				'circle-radius': [
					'*',
					['get', 'radius'],
					1.2
				],
				'circle-stroke-width': 0.5,
				'circle-stroke-color': '#FFF'
			}
		// place layer underneath this layer
		// },firstSymbolId);
		});
	}

	componentDidMount() {
		const data = this.props.data;

		// extents for circles
		this.extent_calcuted = false;
		// set the min/max sizes for circles
		this.range = this.props.range ? this.props.range : [3.5,75];
		
		this.map = new maplibregl.Map({
			// container: this.props.container,
			center: [this.props.center[1], this.props.center[0]],
			container: this.mapContainer,
			maxZoom: this.props.maxZoom,
			minZoom: this.props.minZoom,
			maxZoom: 30,
			style: this.props.mapboxStyle,
      		zoom: this.props.zoom
		});

		// render the map
		if (data.features) {
			this.renderMap(data);
		}
	}

	componentDidUpdate(prevProps) {
		if (this.state.mapIsLoaded) {
			if (this.props.data !== prevProps.data) {
			    this.map.getSource('wildfires').setData(this.props.data);
			}
		} else {
			this.renderMap(this.props.data);
		}

		// has a feature been selected?
		if (this.props.selectedFeature && this.props.selectedFeature !== prevProps.data) {
			this.flyToLocation(this.props.selectedFeature);
			this.showPopup(this.props.selectedFeature, true)
		}
	}

	flyToLocation(currentFeature) {
		this.map.flyTo({
			center: currentFeature.geometry.coordinates,
			zoom: 8
		});
	}
	
	getExtent(data) {
		let fire_size = [];

		data.forEach(d => {
			fire_size.push(parseFloat(d.properties.CURRENT_SZ));
		});
		return [Math.min(...fire_size), Math.max(...fire_size)];
	}

	hidePopup() {
		this.map.getCanvas().style.cursor = '';
		this.popup.remove();
	}

	mapRange(extent, range, value) {
		return range[0] + (value - extent[0]) * (range[1] - range[0]) / (extent[1] - extent[0]);
	}
	
	prepData(data) {
		// we only want to calculate the extent once, otherwise the circle size changes when toggling by fire_type, which is confusing
		if (!this.extent_calcuted) {
			this.extent = this.getExtent(data.features);
			this.extent_calcuted = true;
		}

		// calculate circle size
		data.features.forEach((d,i) => {
			const radius = this.mapRange(this.extent, this.range, d.properties.CURRENT_SZ);
			d.properties.radius = Math.log(radius) * 3;

			// console.log(radius, d.properties.CURRENT_SZ)
			// console.log(this.extent, this.range)
		});

		// reorder array by CURRENT_SI, largest -> smallest
		data.features.sort((a,b) => {
			return b.CURRENT_SI - a.CURRENT_SI;
		});
	}

	setupPopupHandlers() {
		// show & hide the popup
		this.map.on('click', 'wildfires', this.showPopup);
		this.map.on('mouseenter', 'wildfires', this.showPopup);
		this.map.on('mouseleave', 'wildfires', this.hidePopup);
		// this.map.on('mouseenter', 'evacs_alerts', this.showPopup);
		// this.map.on('mouseleave', 'evacs_alerts', this.hidePopup);
		
		// Change the cursor to a pointer when the mouse is over the places layer.
		this.map.on('mouseenter', 'places', function () {
			this.map.getCanvas().style.cursor = 'pointer';
		});
		 
		// Change it back to a pointer when it leaves.
		this.map.on('mouseleave', 'places', function () {
			this.map.getCanvas().style.cursor = '';
		});
	}

	setupPopupText(properties) {
		return WildfireTooltip(properties);
	}

	showPopup(e, sidebarClick) {
		// console.log(e)
		let coords, text;

		if (sidebarClick) {
			coords = {
				lng: e.geometry.coordinates[0],
				lat: e.geometry.coordinates[1]
			}
			text = this.setupPopupText(e.properties);
		} else {
			coords = e.lngLat;
			text = this.setupPopupText(e.features[0].properties);
		}
		// change cursor style as UI indicator
		this.map.getCanvas().style.cursor = 'pointer';

		// set coords based on mouse position
		this.popup.setLngLat(coords)
			// popup content to be displayed
			.setHTML(text)
			.addTo(this.map)
	}

	renderMap(data) {
		this.prepData(data);

		// add fire location
		this.map.on('load', () => {
			// Find the first symbol layer in the map style so we can keep them on top
			let firstSymbolId;
			const layers = this.map.getStyle().layers;
			
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].type === 'symbol') {
					firstSymbolId = layers[i].id;
					break;
				}
			}

			// add firesmoke
			this.addFiresmokeLayer(this.props.fireSmokeUrl, firstSymbolId);

			// Evac and alerts (waiting 1 sec seems to avoid issue where wms json data isn't readable...)
			const interval = setInterval(() => {
				if (this.props.evacsAlerts !== undefined) {
					clearInterval(interval);
					this.addEvacsAlerts(this.props.evacsAlerts, firstSymbolId);
				}
			}, 1000)

			// wildfires
			this.addWildfireLayer(data, firstSymbolId);

			// Add zoom and rotation controls to the map.
			this.map.addControl(new maplibregl.NavigationControl());

			// event handlers for popup
			this.setupPopupHandlers();
		});

		this.setState({
			mapIsLoaded: true
		});
	}

	render() {
		return (
			<Fragment>
				<div ref={el => this.mapContainer = el} />
				<div className="legend-container">
					<p className="legend-title">PM<span className="sub">2.5</span> (µg/m<span className="super">3</span>)</p>
					<img id="firesmoke-legend" src={legend} />
				</div>
			</Fragment>
		);
	}
}


export default CircleMap;