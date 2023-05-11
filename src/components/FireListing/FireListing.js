import React from 'react';
import './FireListing.css';


let buttonStatus = 'open';
const FireListing = (props) => {
	let list;
	const fon = props.data;

	// NO FON? HIDE SIDEBAR
	if (fon.length > 0) {
		// YES FON
		list = fon.sort((a,b) => {
				return b.properties.CURRENT_SZ - a.properties.CURRENT_SZ
			})
			.map(d => {
				return ListItem(d.properties, props.flyToLocation);
			});	

		// show sidebar
		const fonToggle = document.getElementById('switch');
		if (fonToggle !== null) {
			fonToggle.className = 'open';
		}
	} else {
		list = <li className="no-fires"><p>Currently there are no fires of note in B.C.</p></li>

		// hide sidebar
		// buttonStatus = 'closed';
		// const fonToggle = document.getElementById('switch');
		// if (fonToggle !== null) {
		// 	fonToggle.className = 'closed';
		// }
	}


	return (
		<div className="sidebar">
			<div className="header">
				<h2>Fires of Note</h2>
				<div className="button">
					<input type="checkbox" id="switch" className="open" onChange={toggleSidebar} /><label htmlFor="switch"></label>
				</div>
			</div>
			<ul id="listings" className={`listings ${buttonStatus}`}>
				{list}
			</ul>
		</div>
	);
}

function ListItem(data, clickHandler) {
	const size = Math.round((data.CURRENT_SZ / 100) * 10) / 10;
	const name = data.FIRE_NUM; // data.fire_name.split(' (')[0]

	const sizeText = size > 0.1 ? `${size} sq. km` : 'Spot fire';
	return (
		<li key={data.FIRE_ID} id={data.FIRE_ID} className="item" onClick={clickHandler}>
			<h4 className="title">{data.GEOGRAPHIC}</h4>
			<p className="size">{sizeText}</p>
			<p className="location">Started: {data.ignition_date}</p>
		</li>
	);
}

function toggleSidebar(e) {
	// console.log(e.target)
	const sidebar = document.getElementById('listings');

	if (buttonStatus === 'open') {
		e.target.className = 'closed';
		sidebar.className = 'listings closed';
		buttonStatus = 'closed';
	} else {
		e.target.className = 'open';
		sidebar.className = 'listings open';
		buttonStatus = 'open';
	}
}

export default FireListing;
