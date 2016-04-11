import { default as React, Component } from "react";
import ReactDOM from "react-dom";

export default class StrikeTotal extends Component {
  render() {
    const {civilians, children, deaths} = this.props.totals;
    //countries, dates
    return (
      <div className="strike-totals">
        <h2>Totals</h2>
        <ul>
          <li className="strike-total"><span className="total-label">Children Killed:</span> { children }</li>
          <li className="strike-total"><span className="total-label">Civilians Killed:</span> { civilians }</li>
          <li className="strike-total"><span className="total-label">Persons Killed:</span> { deaths }</li>
        </ul>
      </div>
    );
  }
}
