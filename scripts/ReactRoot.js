import { default as React, Component } from 'react';
import { default as ReactDOM } from 'react-dom';
import Map from './Map';
import StrikeDetail from './StrikeDetail';
import speak from './speak';

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strikeIdx: 0,
      showTitle: true,
      totals: {
        children: 0,
        civilians: 0,
        deaths: 0
      }
    }
    // this.validStrikes = strikes.strike.filter(this.validStrike);
  }

  validStrike(strike) {
    return (strike.lat && strike.lon) && (strike.country.trim().toLowerCase() !== 'pakistan-afghanistan border');
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

  speakSummary(bji_summary) {
    var re = /([\d]+)(?:-| - )([\d]+)/g;
    return bji_summary.replace(re, '$1 to $2');
  }

  enhancedStrike(strike) {
    return {
      ...strike,
      latLng: { lat: Number(strike.lat), lng: Number(strike.lon) },
      childCount: this.getCount('children', strike),
      civilianCount: this.getCount('civilians', strike),
      deathCount: this.getCount('deaths_max', strike),
      injuredCount: this.getCount('injuries', strike),
      summary: this.speakSummary(strike.bij_summary_short)
    };
  }

  nextStrike(canSpeak) {
    const { strikeIdx, totals } = this.state;
    const {civilians, children, deaths} = totals;
    if(strikeIdx + 1 >= this.validStrikes.length) {
      this.setState({showTitle: true, strikeIdx: 0, totals: { children: 0, civilians: 0, deaths: 0}});
      return;
    }

    const newStrikeIdx = strikeIdx + 1;
    const strike = this.enhancedStrike(this.validStrikes[newStrikeIdx]);
    window.history.pushState('', '', `${strike._id}`);
    window.localStorage.setItem('strike', strike._id);
    // console.log(strike.latLng);

    if(canSpeak) {
      speak(strike.summary, {}, { end: () => {
       setTimeout(() => {
        this.nextStrike(canSpeak);
       }, 1500);
      }});
    } else {
      setTimeout(() => {
        this.nextStrike(canSpeak);
      }, 10000);
    }

    let newTotals = {
      children: strike.childCount + children,
      civilians: strike.civilianCount + civilians,
      deaths: strike.deathCount + deaths
    }

    this.setState({ strikeIdx: newStrikeIdx, totals: newTotals });
  }

  startStrikes(idx) {
    const strikeIdx = idx || this.state.strikeIdx;
    const strike = this.enhancedStrike(this.validStrikes[strikeIdx]);
    // console.log(strike.latLng);
    const canSpeak = speak(strike.summary, {}, { end: () => {
      setTimeout(() => {
        this.nextStrike(canSpeak);
      }, 2000);
    }});

    if(canSpeak) {
      window.addEventListener('unload', () => {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      })
    }

    if(!canSpeak) {
      setTimeout(() => {
        this.nextStrike(canSpeak);
      }, 10000);
    }
  }

  hideTitle() {
    this.startStrikes();
    this.setState({ showTitle: false });
  }

  getTitle() {
    const count = (this.validStrikes) ? this.validStrikes.length : '';
    return (
      <div className="title-screen" onClick={ this.hideTitle.bind(this) }>
        <h1>{ count } Covert US Drone Strikes</h1>
      </div>
    );
  }

  componentWillMount() {
    fetch('/strikes.json')
    .then((response) => { return response.json(); })
    .then((strikes) => {
      this.validStrikes = strikes.strike.filter(this.validStrike);
      const strikeId = window.location.pathname.replace('/', '') || window.localStorage.getItem('strike');
      if(strikeId) {
        const arrIdx = this.validStrikes.findIndex((strike) => {
          return strike._id === strikeId;
        });

        if(arrIdx > -1) {
          this.setState({ strikeIdx: arrIdx, showTitle: false });
          this.startStrikes(arrIdx);
        }
      } else {
        this.setState({ count: this.validStrikes.length, showTitle: true });
      }
    });
  }

  render() {
    const strike = (this.validStrikes) ? this.enhancedStrike(this.validStrikes[this.state.strikeIdx]) : null;
    const title = (this.state.showTitle) ? this.getTitle() : '';
    const map = (strike) ? (<Map strike={ strike } />) : '';
    const detail = (strike) ? (<StrikeDetail strike={ strike } totals={ this.state.totals } />) : '';
    return (
      <div className="react-root">
        { title }
        { map }
        { detail }
      </div>
    );
  }
}
