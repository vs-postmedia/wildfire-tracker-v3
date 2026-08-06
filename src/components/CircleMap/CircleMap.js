import React, { Fragment, Component } from 'react';
import maplibregl from 'maplibre-gl';
import WildfireTooltip from '../WildfireTooltip/WildfireTooltip';

// CSS
import './maplibre-gl.css';
import './CircleMap.css';

import legend from '../../images/firesmoke-legend-v2.png';

// VARS
const evacColor = '#F6B31C';
const alertColor = '#A7A9AB';
const evacZoomLevel = 10;
const evacMinSize = 220000000;

export class CircleMap extends Component {
	map;
	state = {};
	isPopupPinned = false;
	ignoreNextOutsideClick = false;
	// prep the popup
	popup = new maplibregl.Popup({
		closeButton: false,
		closeOnClick: false
	});

	constructor(props) {
		super(props);

		// bind popup to main component
		this.showPopup = this.showPopup.bind(this);
		this.showEvacPopup = this.showEvacPopup.bind(this);
		this.showPerimeterPopup = this.showPerimeterPopup.bind(this);
		this.hidePopup = this.hidePopup.bind(this);
		this.handleMapClick = this.handleMapClick.bind(this);
	}

	addEvacsAlerts(evacsAlerts, firstSymbolId) {
		// add arcgis source
		this.map.addSource('evacs_alerts_arcgis', {
        	type: 'geojson',
        	data: evacsAlerts
      	});
		// add & style layer
      	this.map.addLayer({
      	  id: 'evacs_alerts_arcgis',
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
      	    'fill-opacity': 0.5
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

	addFirePerimetersLayer(firePerimetersData, firstSymbolId) {
		if (!firePerimetersData || !firePerimetersData.features || firePerimetersData.features.length === 0) {
			return;
		}

		this.map.addSource('fire-perimeters', {
			type: 'geojson',
			data: firePerimetersData
		});
		this.map.addLayer({
			id: 'fire-perimeters',
			type: 'fill',
			source: 'fire-perimeters',
			paint: {
				'fill-color': '#DD2D25',
				'fill-opacity': 0.4,
				'fill-outline-color': '#DD2D25'
			}
		}, firstSymbolId);
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
			if (this.props.firePerimetersData !== prevProps.firePerimetersData && this.map.getSource('fire-perimeters')) {
				this.map.getSource('fire-perimeters').setData(this.props.firePerimetersData);
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

	handleMapClick() {
		if (!this.isPopupPinned) {
			return;
		}

		if (this.ignoreNextOutsideClick) {
			this.ignoreNextOutsideClick = false;
			return;
		}

		this.isPopupPinned = false;
		this.hidePopup();
	}

	hidePopup() {
		this.map.getCanvas().style.cursor = '';
		if (this.isPopupPinned) {
			return;
		}
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
		this.map.on('click', 'wildfires', (e) => {
			this.ignoreNextOutsideClick = true;
			this.showPopup(e, false, true);
		});
		this.map.on('mouseenter', 'wildfires', (e) => this.showPopup(e, false, false));
		this.map.on('mousemove', 'wildfires', (e) => this.showPopup(e, false, false));
		this.map.on('mouseleave', 'wildfires', this.hidePopup);
		this.map.on('click', 'evacs_alerts_arcgis', (e) => {
			this.ignoreNextOutsideClick = true;
			this.showEvacPopup(e, true);
		});
		this.map.on('mouseenter', 'evacs_alerts_arcgis', (e) => this.showEvacPopup(e, false));
		this.map.on('mousemove', 'evacs_alerts_arcgis', (e) => this.showEvacPopup(e, false));
		this.map.on('mouseleave', 'evacs_alerts_arcgis', this.hidePopup);
		this.map.on('click', 'fire-perimeters', (e) => {
			this.ignoreNextOutsideClick = true;
			this.showPerimeterPopup(e, true);
		});
		this.map.on('mouseenter', 'fire-perimeters', (e) => this.showPerimeterPopup(e, false));
		this.map.on('mousemove', 'fire-perimeters', (e) => this.showPerimeterPopup(e, false));
		this.map.on('mouseleave', 'fire-perimeters', this.hidePopup);
		this.map.on('click', this.handleMapClick);

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

	getEvacPopupContent(status) {
		const normalizedStatus = String(status || '').trim().toLowerCase();
		const isOrder = normalizedStatus === 'order';
		const color = isOrder ? evacColor : normalizedStatus === 'alert' ? alertColor : '#A7A9AB';
		const label = isOrder ? 'Evacuation order' : 'Evacuation alert';
		return `<h2 style="color:${color}; font-size:1.25rem; font-weight:700; margin:0;">${label}</h2>`;
	}

	showEvacPopup(e, pin = false) {
		const feature = e.features && e.features[0];
		if (!feature) {
			return;
		}

		const status = feature.properties && feature.properties.ORDER_ALERT_STATUS;
		this.showFeaturePopup(e.lngLat, this.getEvacPopupContent(status), pin);
	}

	showPerimeterPopup(e, pin = false) {
		const feature = e.features && e.features[0];
		if (!feature) {
			return;
		}

		const properties = feature.properties || {};
		this.showFeaturePopup(e.lngLat, this.setupPopupText(properties), pin);
	}

	showFeaturePopup(coords, text, pin = false) {
		this.map.getCanvas().style.cursor = 'pointer';
		this.isPopupPinned = pin;
		this.popup
			.setLngLat(coords)
			.setHTML(text)
			.addTo(this.map);
	}

	showPopup(e, sidebarClick, pin = false) {
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

		this.showFeaturePopup(coords, text, pin);
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

					// fire perimeters
					this.addFirePerimetersLayer(this.props.firePerimetersData, firstSymbolId);
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