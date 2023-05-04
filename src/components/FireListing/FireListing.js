import React from 'react';
import './FireListing.css';


let buttonStatus = 'open';
const FireListing = (props) => {
	// console.log(props.data)
	let list;
	const fon = props.data.length > 0 ? props.data.filter(d => d.properties.FIRE_STATU === 'Fire of Note') : [];

	console.log(fon)

	// NO FON? HIDE SIDEBAR
	if (fon.length > 0) {
		// YES FON
		list = fon.sort((a,b) => {
				return b.properties.CURRENT_SI - a.properties.CURRENT_SI
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
	const size = Math.round((data.CURRENT_SI / 100) * 10) / 10;
	const name = data.FIRE_NT_NM; // data.fire_name.split(' (')[0]

	const sizeText = size > 0.1 ? `${size} sq. km` : 'Spot fire';
	return (
		<li key={data.FIRE_NUMBE} id={data.fire_id} className="item" onClick={clickHandler}>
			<h4 className="title">{name}</h4>
			<p className="size">{sizeText}</p>
			<p className="location">{data.location}</p>
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
