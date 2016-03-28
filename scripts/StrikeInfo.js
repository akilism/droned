import { default as React, Component } from "react";
import ReactDOM from "react-dom";
import _ from "ramda";
import RL from "ramda-lens";
import moment from "moment";
import d3 from "d3";

export default class StrikeInfo extends Component {

	getKey(strike) {
		return strike.country.toLowerCase().replace(' ', '-');
	}

	countries(countries, strike) {
		const key = this.getKey(strike);

		if(countries[key]) {
			countries[key] = {
				name: countries[key].name,
				deathCount: strike.deathCount + countries[key].deathCount,
				injuredCount: strike.injuredCount + countries[key].injuredCount,
				childCount: strike.childCount + countries[key].childCount,
				civilianCount: strike.civilianCount + countries[key].civilianCount,
				strikeCount: countries[key].strikeCount + 1
			};
		} else {
			countries[key] = {
				name: key,
				deathCount: strike.deathCount,
				injuredCount: strike.injuredCount,
				childCount: strike.childCount,
				civilianCount: strike.civilianCount,
				strikeCount: 1
			};
		}

		return countries;
	}

	listItem(country) {
		return (
			<li key={country.name} className="info-item" onClick={ () => {
					this.props.filterFn(country.name);
				} }>
				<h2>{ country.name }</h2>
				<ul>
					<li>{ country.strikeCount } Drone Strikes</li>
					<li>{ country.deathCount } Killed</li>
					<li>{ country.injuredCount } Injured</li>
					<li>{ country.childCount } Children</li>
					<li>{ country.civilianCount } Civilians</li>
				</ul>
			</li>
		)
	}

	render() {
		const strikes = this.props.strikes || [];
		const countries = strikes.reduce(this.countries.bind(this), {});
		const listItems = _.values(_.map(this.listItem.bind(this), countries));

		return (
			<div className="info-box">
				<ul className="info-items">
					{ listItems }
				</ul>
			</div>
		);
	}
}
