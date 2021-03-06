import React from 'react'
import ReactDOM from 'react-dom'
import { Link, Redirect } from 'react-router-dom'
import camelize from '../javascript/camelize.js'
import $ from 'jquery'
import AlertContainer from 'react-alert';

const mapURL = "http:\//localhost:3001/map";

export class PlacesSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      googleLoad: false,
      lastSearch: '',
      mapTime: false
    }
    this.getMapResults = this.getMapResults.bind(this);
  }

  alertOptions = {
    offset: 50,
    position: 'top right',
    theme: 'light',
    time: 3000,
    transition: 'scale'
  }

  loadSearch(){
    if (this.props && this.props.google) {
      // if google is available
      const {google} = this.props;
      const maps = google.maps;
      const node = ReactDOM.findDOMNode(this.refs.autocomplete);
      const searchBox = new maps.places.SearchBox(node);
      // searchBox.addListener('places_changed', function() {
      //     let places = searchBox.getPlaces();
      //     console.log(places[0].formatted_address);
      //     if (places.length == 0) {
      //       return;
      //     }
      //   });
      this.setState({googleLoad: true})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google) {
      this.loadSearch();
    }
  }

  componentDidMount() {
    $.get(`${mapURL}/last`, {user: sessionStorage.getItem('token')})
      .done((data) => {
        const lastSearch = data[0].last_search;
        this.setState({lastSearch: lastSearch});
      })
      .fail((error) => {
        console.log(error.responseText);
      });

  }

  getMapResults(e) {
    if (this.props.filterCount() === 0) {
      this.msg.error('Please Enter Some Filters');
    } else {
      const destination = this.refs.autocomplete.value || this.state.lastSearch;
      $.post(mapURL, {user: sessionStorage.getItem('token'), destination: destination})
        .done((data) => {
          this.setState({mapTime: true});
          // window.location = '/map';
        })
        .fail((error) => {
          console.log(error.responseText);
        });
    }
    e.preventDefault();
  }

  render(){

    if (this.state.mapTime) {
      return (
        <Redirect to="/map"/>
      )
    }    

    const inputStyle = {
      // width: '35%'
      'margin-bottom': '18.76px'
    }

    const headerStyle = {
      'margin-top': '18.76px'
    }

    return (
      <form onSubmit={this.getMapResults}>
        <h2 style={headerStyle}>Where are you going to be?</h2>
        <input
          ref='autocomplete'
          id="pac-input"
          style={inputStyle}
          className="input is-primary controls column is-11"
          type="text"
          placeholder={this.state.lastSearch}
        />
        <input type="submit" className='button is-primary' value='View Map' />
        <AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
      </form>
    )
  }
}

export default PlacesSearch;
