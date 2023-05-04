import React from 'react';
import './ThumbnailCard.css';

const ThumbnailCard = (props) => {
	const fire = props.data;

	// console.log(fire)
	return (
		<div className='thumbnail-card' onClick={() => props.listClickHandler(fire)}>
			<h3>{fire.fire_name.split(' (')[0]}</h3>
			<p className='started-date'>{fire.discovered.split('day, ')[1]}</p>
			<p className='size'>{fire.size.replace('.0', '')}</p>
		</div>
	);
}

export default ThumbnailCard;