import { default as React, Component } from "react";
import ReactDOM from "react-dom";
import _ from "ramda";
import RL from "ramda-lens";
import moment from "moment";
import d3 from "d3";

export default class StrikeDetail extends Component {
	render() {
		const strike = this.props.strike;

		return (
			<div className="strike-info-box">
				<div className="marker-name">{ strike.location }</div>
				<div className="marker-info strike-country">{ strike.country }</div>
				<div className="marker-info strike-date">Date: { moment(strike.date).format("Do MMM YYYY") }</div>
				<div className="marker-info">Deaths: { strike.deaths }</div>
				<div className="marker-info">Civilians: { strike.civilians }</div>
				<div className="marker-info">Children: { strike.children }</div>
				<div className="marker-info strike-summary">{ strike.bij_summary_short ? strike.bij_summary_short : strike.narrative }</div>
				<div className="marker-info"><a className="strike-story-link" href={ strike.bij_link } target="_blank">Read More</a></div>
			</div>
		);
	}
}
