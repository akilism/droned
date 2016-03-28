import { default as React, Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'ramda';
import moment from 'moment';
import d3 from 'd3';
import StrikeInfo from './StrikeInfo';
import StrikeDetail from './StrikeDetail';

import strikes from '../data/strikes.json';

const tLocs = [{
	name: 'North East United States',
	yemen: { lat: 41.516310, lng: -75.041211 },
	pakistan: { lat: 41.173310, lng: -73.851211 },
	somalia: { lat: 41.216310, lng: -74.041211 },
}];

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	translatePos: null,
    	marker: null,
    	markerZoom: false,
    	filterCountry: null,
    	strike: null,
    	reboundMap: true
    };

    this.map = null;
    this.tileLayer = null;
    this.bounds = null;
  }

/* Strike
{
	_id: "55c79e711cbee48856a30886",
	number: 1,
	country: "Yemen",
	date: "2002-11-03T00:00:00.000Z",
	narrative: "In the first known US targeted assassination using a drone, a CIA Predator struck a car, killing 6 people.",
	town: "",
	location: "Marib Province",
	deaths: "6",
	deaths_min: "6",
	deaths_max: "6",
	civilians: "0",
	injuries: "",
	children: "",
	tweet_id: "278544689483890688",
	bureau_id: "YEM001",
	bij_summary_short: "In the first known US targeted assassination using a drone, a CIA Predator struck a car killing six al Qaeda suspects.",
	bij_link: "http://www.thebureauinvestigates.com/2012/03/29/yemen-reported-us-covert-actions-since-2001/",
	target: "",
	lat: "15.47467",
	lon: "45.322755",
	articles: [ ],
	names: [
		"Qa'id Salim Sinan al-Harithi, Abu Ahmad al-Hijazi, Salih Hussain Ali al-Nunu, Awsan Ahmad al-Tarihi, Munir Ahmad Abdallah al-Sauda, Adil Nasir al-Sauda'"
	]
}
*/

  validStrike(strike) {
  	return (strike.lat && strike.lon) && (strike.country.trim().toLowerCase() !== 'pakistan-afghanistan border');
  }

  markerOptions(strike) {
    return {
    	className: 'strike',
      title: strike._id,
      alt: strike._id
    };
  }

  translateLatLng(orig, diff) {
  	return { lat: orig.lat + diff.lat, lng: orig.lng + diff.lng };
  }

  strikeMarker(diff, zoom, strike) {
  	const latLng = (diff) ? this.translateLatLng(strike.latLng, diff) : strike.latLng;
    const marker = L.circleMarker(latLng, this.markerOptions(strike));

    marker.setRadius(Math.min(zoom + 2, 10));
    marker.on('click', (evt) => {
    	console.log('click', strike.latLng);
      this.zoomMarker(strike, null);
    });

    // marker.bindPopup(strike.markerHtml);

    marker.on('mouseover', (evt) => {
      // evt.target.openPopup();
      this.setState({strike, reboundMap: false});
    });

    marker.on('mouseout', (evt) => {
      // evt.target.closePopup();
    });

    return marker;
  }

  strikeMarkerHTML(strike) {
  	return `<div class="marker-name">${strike.location}</div>
      <div class="marker-location">${strike.country}</div>
      <div class="marker-location">Date: ${moment(strike.date).format("Do MMM YYYY")}</div>
      <div class="marker-location">Deaths: ${strike.deaths}</div>
      <div class="marker-location">Civilians: ${strike.civilians}</div>
      <div class="marker-location">Children: ${strike.children}</div>`;
  }

  byDate(strike) {
  	const { activeYear } = this.state;
  	if(activeYear) {
  		return moment(strike.date).isSame(`${activeYear}-01-01`, 'year');
  	}

  	return true;
  }

  byType(strike) {
  	if(this.state.filterCountry) {
  		return strike.country.trim().toLowerCase() === this.state.filterCountry;
  	}
  	return true;
  }

  zoomMarker(marker, evt) {
    if(evt) { evt.preventDefault(); }
    this.tileLayer.setUrl('http://khm3.google.com/kh/v=198&x={x}&y={y}&z={z}&s=Galileo');
    this.map.setView(marker.latLng, 16);
    this.setState({ marker, markerZoom: true });
  }

  unzoomMap(evt) {
  	if(evt) { evt.preventDefault(); }
    this.tileLayer.setUrl('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');

    // LMap.fitBounds(this.bounds,  { animate: true, duration: 0.5, maxZoom: 5, padding: [10, 10] });
    this.setState({ marker: null, markerZoom: false, reboundMap: true });
  }

  addStrikes(strikes, LMap) {
  	LMap.eachLayer((layer) => {
  		if(!layer.options.tileSize) {
  			LMap.removeLayer(layer);
  		}
  	});

  	const filteredStrikes = strikes.filter(this.byDate.bind(this)).filter(this.byType.bind(this));

    this.bounds = L.latLngBounds(filteredStrikes.map((strike) => { return strike.latLng; }));

    const boundsCenter = this.bounds.getCenter();
    const { translatePos } = this.state;
    const zoom = LMap.getZoom();
    const diff = translatePos ? { lat: translatePos.lat - boundsCenter.lat, lng: translatePos.lng - boundsCenter.lng } : false;
    const markers = filteredStrikes.map(this.strikeMarker.bind(this, diff, zoom));

    markers.forEach((marker) => {
      marker.addTo(LMap);
    });

    if(diff) {
    	this.bounds = L.latLngBounds(filteredStrikes.map((strike) => {
    		return this.translateLatLng(strike.latLng, diff);
    	}));
    }

    if(this.state.reboundMap) {
    	LMap.fitBounds(this.bounds,  { animate: true, duration: 0.5, maxZoom: 5, padding: [10, 10] });
    }
  }

  getStrikes() {
  	return new Promise((resolve, reject) => {
  		resolve(strikes.strike);
  	});
  }

  getCount(key, strike) {
  	if(!strike[key]) { return 0; }

  	const hasDash = strike[key].indexOf('-') > -1;
  	const hasWords = strike[key].match(/[a-z\?]/i);
  	if(!hasWords && !hasDash) {
  		return parseInt(strike[key], 10);
  	} else if(hasDash) {
  		const vals = strike[key].split('-').map((v) => v.trim() );
  		const val = parseInt(vals[1], 10);
  		const val0 = parseInt(vals[0], 10);
  		if(isNaN(val) && isNaN(val0)) {
  			return 0;
  		} else if (isNaN(val)) {
  			return val0;
  		} else {
  			return val;
  		}
  	} else {
  		//not sure what to do here. no clear way to say what is in this field if there are words.
  		return 0;
  	}
  }

  enhancedStrike(strike) {
  	return {
  		...strike,
			markerHtml: this.strikeMarkerHTML(strike),
    	latLng: { lat: Number(strike.lat), lng: Number(strike.lon) },
    	childCount: this.getCount('children', strike),
    	civilianCount: this.getCount('civilians', strike),
    	deathCount: this.getCount('deaths_max', strike),
    	injuredCount: this.getCount('injuries', strike)
    };
  }

  componentDidMount() {
    this.map = L.map(this.refs['mapElem'], { scrollWheelZoom: false }).setView([ 50.973325, 1.883172 ], 6);

    this.map.on('click', function(e) {
      console.log(e.latlng);
		});

    this.tileLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>`,
      subdomains: 'abcd',
      maxZoom: 18
	  });

    this.tileLayer.addTo(this.map);
		this.getStrikes()
    .then((strikes) => {
    	console.log('total strikes:', strikes.length);
    	const validStrikes = strikes.filter(this.validStrike).map(this.enhancedStrike.bind(this));
    	this.setState({ strikes: validStrikes });
    });
  }

  setTranslatePos(translatePos) {
  	this.tileLayer.setUrl('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
  	if(this.state.translatePos) {
  		this.setState({ translatePos: null, reboundMap: true });
  	} else {
  		this.setState({ translatePos, reboundMap: true });
  	}
  }

  componentDidUpdate(prevProps, prevState) {
  	if(this.state.reboundMap) {
  		this.addStrikes(this.state.strikes, this.map);
  	}
  }

  setFilterCountry(country) {
  	this.tileLayer.setUrl('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
  	const tPos = (!this.state.translatePos) ? null : tLocs[0][country];
  	this.setState({ filterCountry: country, translatePos: tPos, reboundMap: true });
  }

  setYear(activeYear) {
  	this.tileLayer.setUrl('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
  	this.setState({activeYear, reboundMap: true});
  }

  yearSelector(activeYear) {
  	return (
  		<ul className="year-list">
  			<li className={(activeYear === 2002) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2002)}>2002</li>
  			<li className={(activeYear === 2003) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2003)}>2003</li>
  			<li className={(activeYear === 2004) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2004)}>2004</li>
  			<li className={(activeYear === 2005) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2005)}>2005</li>
  			<li className={(activeYear === 2006) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2006)}>2006</li>
  			<li className={(activeYear === 2007) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2007)}>2007</li>
  			<li className={(activeYear === 2008) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2008)}>2008</li>
  			<li className={(activeYear === 2009) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2009)}>2009</li>
  			<li className={(activeYear === 2010) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2010)}>2010</li>
  			<li className={(activeYear === 2011) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2011)}>2011</li>
  			<li className={(activeYear === 2012) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2012)}>2012</li>
  			<li className={(activeYear === 2013) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2013)}>2013</li>
  			<li className={(activeYear === 2014) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2014)}>2014</li>
  			<li className={(activeYear === 2015) ? 'active-year' : ''} onClick={this.setYear.bind(this, 2015)}>2015</li>
  			<li className={(!activeYear) ? 'active-year' : ''} onClick={this.setYear.bind(this, null)}>All years</li>
  		</ul>
  	);
  }

  render() {
  	const filterCountry = this.state.filterCountry;
  	const tPos = (filterCountry) ? tLocs[0][filterCountry] : {};
  	const viewToggle = (filterCountry) ? (<div className="view-toggle" onClick={this.setTranslatePos.bind(this, tPos)}>Swap view.</div>) : '';
  	const strikeInfo = (<StrikeInfo filterFn={ this.setFilterCountry.bind(this) } strikes={ this.state.strikes } />);
		const zoomContol = (this.state.markerZoom) ? (<div className="view-toggle" onClick={this.unzoomMap.bind(this)}>View all drone strikes.</div>) : '';
		const strikeDetail = (this.state.strike) ? (<StrikeDetail strike={this.state.strike} />) : '';
    return (
      <div className="react-root">
      	<div className="overlay">
      		{strikeInfo}
      		{this.yearSelector(this.state.activeYear)}
      		<br />
      		{zoomContol}
      		{viewToggle}
      	</div>
        <div className="map" ref="mapElem"></div>
        {strikeDetail}
      </div>
    );
  }
}
