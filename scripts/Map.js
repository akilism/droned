import { default as React, Component } from 'react';
import ReactDOM from 'react-dom';

export default class Map extends Component {
  constructor(props) {
    super(props);

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

  markerOptions(strike) {
    return {
      className: 'strike',
      title: strike._id,
      alt: strike._id
    };
  }

  addStrike(strike, LMap) {
    const marker = L.circleMarker(strike.latLng, this.markerOptions(strike));
    const zoom = LMap.getZoom();
    marker.setRadius(Math.min(zoom + 2, 10));
    // marker.addTo(LMap);

    // marker.on('click', (evt) => {
    //   console.log('click', strike.latLng);
    //   this.zoomMarker(strike, null);
    // });

    // marker.bindPopup(strike.markerHtml);

    // marker.on('mouseover', (evt) => {
    //   // evt.target.openPopup();
    //   this.setState({strike, reboundMap: false});
    // });

    // marker.on('mouseout', (evt) => {
    //   // evt.target.closePopup();
    // });

  }

  zoomMarker(marker, evt) {
    if(evt) { evt.preventDefault(); }
    this.map.setView(marker.latLng, 17);
  }

  componentDidMount() {
    this.map = L.map(this.refs['mapElem'], { scrollWheelZoom: false }).setView([ 50.973325, 1.883172 ], 6);

    this.map.on('click', function(e) {
      console.log(e.latlng);
		});

    this.tileLayer = L.tileLayer('http://khm3.google.com/kh/v=198&x={x}&y={y}&z={z}&s=Galileo', {
      attribution: `&copy; <a href="http://maps.google.com/copyright">Google</a>`,
      subdomains: 'abcd',
      maxZoom: 19
	  });

    this.tileLayer.addTo(this.map);
    this.addStrike(this.props.strike, this.map);
    this.map.setView(this.props.strike.latLng, 17);
  }

  componentDidUpdate(prevProps, prevState) {
    this.addStrike(this.props.strike, this.map);
  	this.map.setView(this.props.strike.latLng, 17);
  }

  render() {
    return (
      <div className="map" ref="mapElem"></div>
    );
  }
}
