import React, { Component, Fragment } from 'react';
import Axios from 'axios'
import WildfireMap from '../WildfireMap/WildfireMap';

export class WildfireTracker extends Component {

	state = {
		data: [],
		data_all: [],
		data_fon: [],
		selected_feature: null
	}

	componentDidMount() {
		Axios.get(this.props.currentData)
			.then(resp => {
				// filter "out" fires so they don't overwhelm map
				const noOut = {
					type: 'FeatureCollection',
					features: resp.data.features.filter(d => d.properties.STATUS !== 'Out')
				};

				// update our state with the new data
				this.setState({
					data: noOut,
					data_all: resp.data,
				});

				// prep the fires of Note
				this.setState({
					data_fon: noOut.features.filter(d => d.properties.STATUS === 'Fire of Note')
				});

				// download alert & evacuation perimeter data
				this.fetchEvacs(this.props.evacsAlertsUrl);
			});

		this.flyToLocation = this.flyToLocation.bind(this);
		this.toggleFireTypeHandler = this.toggleFireTypeHandler.bind(this);
	}

	fetchEvacs(url) {
		Axios.get(url)
			.then(results => {
				if (results.status === 200) {
					this.setState({
						data_evacs: results.data
					});
				}
			});
	}

	filterFireData(fire_class) {
		// currently, 'new' & 'out-of-control' fires are listed as new. Not sure if this is ideal. 
		if (fire_class === 'new') {
			let data_array = [];
			this.state.data_all.features.forEach(d => {
				const STATUSs = d.properties.STATUS.replace(/\s/g, '-').toLowerCase();

				if (STATUSs === fire_class | STATUSs === 'out-of-control') {
					data_array.push(d);
				}
			});

			return data_array;
		} else {
			return this.state.data_all.features.filter(d => d.properties.STATUS.replace(/\s/g, '-').toLowerCase() === fire_class);
		}
	}

	flyToLocation(e) {
		// console.log(e.target.parentNode.id)
		this.setState({
			selected_feature: this.state.data_fon.filter(d => parseInt(d.properties.FIRE_ID) === parseInt(e.target.parentNode.id))[0]
		});
	}

	toggleFireTypeHandler(e) {
		let fire_data = {
			type: 'FeatureCollection'
		};
		let fire_class = e.target.className.split(' ')[1];


		if (fire_class === this.state.data_displayed) {
			// keep 
			fire_data.features = this.state.data_all.features.filter(d => d.properties.STATUS !== 'Out');
			// reset
			fire_class = null;
		} else if (fire_class === 'out') {
			// console.log('OUT')
			fire_data = this.state.data_all;
		} else {
			fire_data.features = this.filterFireData(fire_class);
		}

		this.setState({
			data_displayed: fire_class,
			data: fire_data
		});
	}


	render() {
		return (
			<Fragment>
				<WildfireMap 
					config={this.props.mapboxConfig}
					selectedFeature={this.state.selected_feature}
					data={this.state.data}
					data_all={this.state.data_all}
					data_evacs={this.state.data_evacs}
					data_fon={this.state.data_fon}
					fireSmokeUrl={this.props.fireSmokeUrl}
					mapboxStyle={this.props.mapboxStyle}
					tiles={this.props.tiles}
					flyToLocation={this.flyToLocation}
					toggleFireTypeHandler={this.toggleFireTypeHandler}>
				</WildfireMap>
			</Fragment>
		);
	}
}

export default WildfireTracker;