import { default as React, Component } from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import StrikeTotal from './StrikeTotal';

export default class StrikeDetail extends Component {
	render() {
		const strike = this.props.strike;
    const civilians = (strike.civilians) ? (<div className="marker-info strike-count"><span className="marker-label">Civilians:</span> { strike.civilians }</div>) : '';
    const children = (strike.children) ? (<div className="marker-info strike-count"><span className="marker-label">Children:</span> { strike.children }</div>) : '';
		return (
			<div className="strike-info-box">
				<div className="marker-name">{ strike.location } #{ strike.number }</div>
				<div className="strike-details">
          <div className="marker-info strike-country"><span className="marker-label">Country:</span> { strike.country }</div>
				  <div className="marker-info strike-date"><span className="marker-label">Date:</span> { moment(strike.date).format("Do MMMM YYYY") }</div>
				  <div className="marker-info strike-count"><span className="marker-label">Deaths:</span> { strike.deaths }</div>
          { civilians }
				  { children }
        </div>
				<div className="marker-info strike-summary">{ strike.bij_summary_short ? strike.bij_summary_short : strike.narrative }</div>
				<StrikeTotal totals={ this.props.totals } />
        <div className="marker-info"><a className="strike-story-link" href={ strike.bij_link } target="_blank">Read More</a></div>
			</div>
		);
	}
}
