import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor () {
    super();

    this._toggleMenu = this._toggleMenu.bind(this);
    this._onChange = this._onChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleSelectChange = this._handleSelectChange.bind(this);

    this.state = {
      menu_visibility: "hidden",
      add_ticker: "",
      add_cost_basis: "",
      add_hodl: "",
      coinz: {},
      preferences: {
        currency: "USD"
      }
    }
  }

  componentWillMount(){
    // if user doesnt have json
    if (!localStorage.hasOwnProperty('coinz')) {
      const localCoins = {};
      // object to array for map
      const lStore = Object.entries(localStorage);
      lStore.map((key) => {
        const ticker = key[0].replace(/_.*/i, '');
        const cost = ticker + "_cost_basis";
        const hodl = ticker + "_hodl";

        // if localCoins doesnt have the ticker yet, create it
        // add localStorage key to localCoins for state
        if (!localCoins.hasOwnProperty(ticker)) {
          localCoins[ticker] = {hodl: null, cost_basis: null};
          if (key[0] === cost) {
            // key[x] needs to be converted into number
            localCoins[ticker].cost_basis = Number(key[1]);
          } else if (key[0] === hodl) {
            localCoins[ticker].hodl = Number(key[1]);
          } else {
            console.log('invalid localStorage');
          }
        // localCoins has the ticker, so we add to it instead
        } else {
          if (key[0] === cost) {
            localCoins[ticker].cost_basis = Number(key[1]);
          } else if (key[0] === hodl) {
            localCoins[ticker].hodl = Number(key[1]);
          } else {
            console.log('invalid localStorage');
          }
        }
      })
      // convert to string for localStorage
      const stringCoins = JSON.stringify(localCoins);
      const jsonCoins = JSON.parse(stringCoins);
      // clear out old way of localStorage
      localStorage.clear();
      // add new json string to localStorage
      localStorage.setItem('coinz', stringCoins);

      const newCoinsState = {
        coinz: jsonCoins
      }
      this.setState(newCoinsState);
    } else if (localStorage.hasOwnProperty('coinz')) {
      const jsonCoins = JSON.parse(localStorage.coinz);
      const localPref = localStorage.pref
        ? JSON.parse(localStorage.pref)
        : this.state.preferences;
      const newCoinsState = {
        coinz: jsonCoins,
        preferences: {
          currency: localPref.currency
        }
      }
      this.setState(newCoinsState);
    }



  }

  componentDidMount(){
    this._marketPrice();
  }

  _numberWithCommas(d) {
    return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  _costBasis(){
    var cost = 0;

    for (var coin in this.state.coinz) {
      const cost_basis = this.state.coinz[coin].cost_basis;
      const hodl = this.state.coinz[coin].hodl;
      if (hodl){
        cost = cost + (hodl * cost_basis);
      }
    }

    return cost //.toFixed(2);
  }

  _portfolioValue(){
    var value = 0;

    for (var coin in this.state.coinz) {
      const hodl = this.state.coinz[coin].hodl;
      const curr_price = this.state.coinz[coin].curr_price;
      if (hodl){
        value = value + (hodl * curr_price);
      }
    }

    return value //.toFixed(2);
  }

  _totalGainLoss(){
    return ( this._portfolioValue() - this._costBasis() ) //.toFixed(2);
  }

  _percentReturn(){
    return ( 100 * ( ( this._portfolioValue() / this._costBasis() ) - 1 ) ) //.toFixed(2);
  }

  _marketPrice(){
    const tempState = this.state.coinz;
    const currency = '-' + this.state.preferences.currency.toLowerCase();
    for (var coin in this.state.coinz) {
      var count = 1;
      const numCoins = Object.keys(this.state.coinz).length;
      const endpoint = 'https://api.cryptonator.com/api/ticker/'+ coin.toLowerCase() + currency;

      fetch(endpoint)
      .then(function(res) {
        if (!res.ok) {
            throw Error(res.statusText);
        }
        return res;
      })
      .then((res) => res.json())
      .then(function(res){
        const price = res.ticker.price;
        // var coin was not keeping the correct value in here
        // using res.ticker.base instead
        const theCoin = res.ticker.base.toLowerCase();
        tempState[theCoin].curr_price = price;
      })
      .then(function(){
        count++;
        if (count >= numCoins) {
          this.setState({coinz: tempState});
        }
      }.bind(this))
    }

  }

  _toggleMenu(){
    if (this.state.menu_visibility === "hidden") {
      this.setState({menu_visibility: ""})
    } else {
      this.setState({menu_visibility: "hidden"})
    }
  }

  _handleSubmit (e) {
    e.preventDefault();

    const currentCoins = JSON.parse(localStorage.coinz) || {};
    const ticker = this.state.add_ticker.toLowerCase();
    const costBasis = Number(this.state.add_cost_basis);
    const hodl = Number(this.state.add_hodl);

    currentCoins[ticker] = {
      cost_basis: costBasis,
      hodl: hodl
    }

    const stringCoins = JSON.stringify(currentCoins);

    localStorage.setItem("coinz", stringCoins);

    window.location.href = window.location.href;
  }

  _currencySymbol(ticker){
    const symbol = {
      usd: "$",
      btc: "฿",
      cad: "$",
      eur: "€",
      jpy: "¥",
      cny: "¥",
      rur: "₽",
      uah: "₴"
    }
    return symbol[ticker.toLowerCase()];
  }

  _handleSelectChange(e){
    const domElement = e.target.id;
    const statePref = this.state.preferences;
    const localPref = localStorage.pref
      ? JSON.parse(localStorage.pref)
      : {};

    localPref[domElement] = e.target.value;
    statePref[domElement] = e.target.value;

    localStorage.setItem('pref', JSON.stringify(localPref));
    this.setState(statePref);

    this._marketPrice();
  }

  _onChange (e) {
    var text = e.target.value;
    var item = e.target.className;

    this.setState({[item]: text});
  }

  render() {
    const coinStats = Object.entries(this.state.coinz);
    const totalGainLoss = this._totalGainLoss();
    const currencyPref = this.state.preferences.currency
    const avgCostBasis = "Average Cost Basis ("+ this._currencySymbol(this.state.preferences.currency) +"/per coin)"
    const headerColor = totalGainLoss < 0
      ? "App-header red"
      : "App-header";
    const gainz = Object.keys(this.state.coinz).length
      ? "$" + this._numberWithCommas(totalGainLoss.toFixed(2)) + " (" + this._numberWithCommas(this._percentReturn().toFixed(2)) + "%)"
      : "Use the menu to add your coin holdings";
    return (
      <div className="App">
        <i onClick={this._toggleMenu} className="btn-menu fa fa-lg fa-bars" aria-hidden="true"></i>
        <div id="menu-body" className={this.state.menu_visibility}>
          <i onClick={this._toggleMenu} className="btn-menu fa fa-lg fa-times" aria-hidden="true"></i>

          <label htmlFor="currency">{this._currencySymbol(this.state.preferences.currency) || "USD"}</label>
          <select id="currency" onChange={this._handleSelectChange} value={currencyPref} name="select">
            <option value="USD">{this._currencySymbol('usd')} USD</option>
            <option value="BTC">{this._currencySymbol('btc')} BTC</option>
            <option value="CAD">{this._currencySymbol('cad')} CAD</option>
            <option value="EUR">{this._currencySymbol('eur')} EUR</option>
            <option value="CNY">{this._currencySymbol('cny')} CNY</option>
            <option value="JPY">{this._currencySymbol('jpy')} JPY</option>
            <option value="RUR">{this._currencySymbol('rur')} RUR</option>
            <option value="UAH">{this._currencySymbol('uah')} UAH</option>
          </select>

          <hr />
          <h3>Add a Coin</h3>
          <form className="" onSubmit={this._handleSubmit}>
                <input type="text"
                  className="add_ticker"
                  onChange={this._onChange}
                  value={this.state.ticker}
                  placeholder="Ticker: (BTC, LTC, etc)"/>
                  <br/>
                <input type="text"
                  className="add_cost_basis"
                  onChange={this._onChange}
                  value={this.state.cost_basist}
                  placeholder={avgCostBasis}/>
                  <br/>
                <input type="text"
                  className="add_hodl"
                  onChange={this._onChange}
                  value={this.state.hodl}
                  placeholder="Number of Coins Held"/>
                <br/>
                <input className="" type="submit" value="Go"/>
            </form>

        </div>

        <div className={headerColor}>
          <div className="Overview">
          <h1>
            {this._currencySymbol(this.state.preferences.currency)}{this._numberWithCommas(this._portfolioValue().toFixed(2))}
          </h1>
          <h2>
            {gainz}
          </h2>
          </div>
        </div>
        <div className="Coins">
          {coinStats.map(function(coin, i){
            const ticker = coin[0].toUpperCase();
            const hodl = parseFloat(Number(coin[1].hodl).toFixed(2));
            const gain_loss = ((Number(coin[1].curr_price) - Number(coin[1].cost_basis) ) * Number(coin[1].hodl) ).toFixed(2);
            const curr_price = Number(coin[1].curr_price).toFixed(2);
            const color = gain_loss >= 0 ? "green" : "red";

            if (!Number(hodl)) {
              return null;
            } else {
              return (
                <div key={i} className="coin">
                  <p className="float-left">
                    {ticker}<br/>
                    <span>{this._numberWithCommas(hodl)} Coins</span>
                  </p>
                  <p className="text-right float-right">
                    <span className={color}>{this._currencySymbol(this.state.preferences.currency)}{this._numberWithCommas(gain_loss)}</span><br/>
                    <span>{this._currencySymbol(this.state.preferences.currency)}{this._numberWithCommas(curr_price)}</span>
                  </p>
                </div>
              );
            }

          }.bind(this))}
        </div>
      </div>
    );
  }
}

export default App;
