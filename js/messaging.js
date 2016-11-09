import { rootRef, firebase_init } from './firebase_config.js';
import React from 'react';
import ReactDOM from 'react-dom';
//import RemovePastUsers from './removePastUsers'
var firebase = require('firebase');
var _ = require('lodash');


var DateApp = React.createClass({

  getInitialState: function(){
    return{

    }
  },

  componentDidMount: function(){

  },

  render: function(){
    return(
      <h1> Messagin </h1>
    )
  }

});

ReactDOM.render(
  <DateApp />, document.getElementById('content')
);
