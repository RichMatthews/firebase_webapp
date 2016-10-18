import { rootRef, firebase_init } from './firebase_config.js';
import React from 'react';
import ReactDOM from 'react-dom';

var firebase = require('firebase');
var _ = require('lodash');

// app state
var _USERS = [];
var _ARRAY_OF_PAST_USERS = [];
var _ARRAY_OF_FUTURE_USERS = [];
var _LOGGED_IN_USER = [];
var _MATCHES = [];


document.getElementById('like').onclick = function(){ return likeButtonClicked(_USERS[0]); }
document.getElementById('dislike').onclick = function(){ return dislikeButtonClicked(_USERS[0]); }

// function pullAllUsersFromDB(){
//    return onChildValue(rootRef, 'users').
//    then(formatUsers);
//  }

// constructor(props){
//  super(props);
//  this.state = {all_users: []};
//  this.myfunc = this.myfunc.bind(this);
// }
var DateApp = React.createClass({


  pullAllUsersFromDB: function(query){
    return new Promise((resolve, reject) => {
        firebase.database().ref(query).on('value', resolve);
      })
  },

  tempFunction: function(){
    pullAllUsersFromDB('/users/').then((results) => {
        this.setState({all_users: results})
        console.log(results);
      //   _USERS = users_array;
      //   welcomeTheUser(users_array);
      //   addUsersToFutureUsers(users_array, _LOGGED_IN_USER);
      //   removePastLikedUsersFromFutureUsersArray();
      //   removePastDisLikedUsersFromFutureUsersArray(users_array);
      //   //displayMatches();
      //   displayNextUser();
      //   retrieveMatches();
      //   //return _USERS;
    })
  },


  onChildValue: function(rootRef, route) {
     return new Promise(function(resolve, reject){
        rootRef.child(route).on('value', resolve);
     })
  },

  formatUsers: function(snapshot){
    var users_object = snapshot.val();
    var users_array = Object.keys(users_object).map(function(key) {
      return users_object[key];
    });
    return users_array; //return is [Object, Object, Object, Object]
  },

  retrieveMatches: function(){
    var tableResult = makeHTMLMatchesTable(fetchMatches());
    var matches = document.getElementById('matches')
    matches.parentNode.insertBefore(tableResult, matches);
  },

  welcomeTheUser: function(users_array){
    var welcomeUser = document.getElementById('welcome');
    var cookie_value = document.cookie.split('=')[1];
      for (var i = 0; i < _USERS.length; i++) {
        if (_USERS[i].useruid == cookie_value){
          var logged_in_user_object = _USERS[i];
          welcomeUser.innerHTML = "Welcome " + logged_in_user_object.name;
          _LOGGED_IN_USER.push(logged_in_user_object)
        }
      }
  },

  addUsersToFutureUsers: function(users_array, _LOGGED_IN_USER){
    for (var i = 0; i < _USERS.length; i++) {
      if (_USERS[i].useruid != _LOGGED_IN_USER[0].useruid){
        _ARRAY_OF_FUTURE_USERS.push(_USERS[i]);
      }
    }
  },

  removePastLikedUsersFromFutureUsersArray: function(){
    var pastLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/liked_users');
    var pastLikedUsersArray = [];
      pastLikedUsers.on('value', function(snapshot) {
        for (var key in snapshot.val()){
          pastLikedUsersArray.push(key)
        }
      });
    for (var i=0; i<_ARRAY_OF_FUTURE_USERS.length; i++) {
       if (pastLikedUsersArray.indexOf(_ARRAY_OF_FUTURE_USERS[i].useruid) != -1) {
          _ARRAY_OF_FUTURE_USERS.splice(i, 1);
          i--;
       }
    }
  },

 removePastDisLikedUsersFromFutureUsersArray: function(){
  var pastDisLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/disliked_users');
  var pastDisLikedUsersArray = [];
  pastDisLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        pastDisLikedUsersArray.push(key)
      }
    });
  for (var i=0; i<_ARRAY_OF_FUTURE_USERS.length; i++) {
     if (pastDisLikedUsersArray.indexOf(_ARRAY_OF_FUTURE_USERS[i].useruid) != -1) {
        _ARRAY_OF_FUTURE_USERS.splice(i, 1);
        i--;
     }
  }

},

removeDecidedUserFromArray: function(user){
  _ARRAY_OF_FUTURE_USERS.splice(user, 1)
  _ARRAY_OF_PAST_USERS.push(user)
},

displayNextUser: function() {
  var myIndex = 0;
  var printUser = document.getElementById('displayUsers');
  if (_ARRAY_OF_FUTURE_USERS.length > 0){
    printUser.innerHTML = _ARRAY_OF_FUTURE_USERS[0].name
  }
  else {
    document.getElementById("like").disabled = true;
    document.getElementById("dislike").disabled = true;
    printUser.innerHTML = 'You are out of people';
  }
},



likeButtonClicked: function(user, users_array){
  user = _ARRAY_OF_FUTURE_USERS[0];
  var logged_in_user = _LOGGED_IN_USER[0]
    liked(logged_in_user.useruid, user.useruid, user.name);
    isItAMatch(logged_in_user.useruid, _ARRAY_OF_FUTURE_USERS);
    removeDecidedUserFromArray(user.useruid);
    displayNextUser();
},

 liked: function(useruid, likedUseruid, likedUserName){
  var postData = {
    likedUserName: likedUserName,
    likedUseruid: likedUseruid
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/liked_users/' + likedUseruid] = postData;
  return firebase.database().ref().update(updates);
},

 dislikeButtonClicked: function(user){
  user = _ARRAY_OF_FUTURE_USERS[0];
  var logged_in_user = _LOGGED_IN_USER[0];
    disliked(logged_in_user.useruid, user.useruid, user.name);
    removeDecidedUserFromArray(user.useruid);
    displayNextUser();
},

 disliked: function(useruid, dislikedUseruid, dislikedUserName){
  var postData = {
    dislikedUserName: dislikedUserName,
    dislikedUseruid: dislikedUseruid
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/disliked_users/' + dislikedUseruid] = postData;
  return firebase.database().ref().update(updates);
},

makeAMatch: function(useruid, likedUseruid){
  var postData = {
    likedUseruid: likedUseruid
  };
  var postData2 = {
    likeduseruid: useruid
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/matches/' + likedUseruid] = postData;
  updates['/users/' + likedUseruid + '/matches/' + useruid] = postData2;
  console.log(updates, 'updates');
  return firebase.database().ref().update(updates);
},

isItAMatch: function(logged_in_user, _ARRAY_OF_FUTURE_USERS){
  var viewedUserLikedUsers = firebase.database().ref('users/' + _ARRAY_OF_FUTURE_USERS[0].useruid + '/liked_users');
  var viewedUserLikedUsersArray = [];
  viewedUserLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        viewedUserLikedUsersArray.push(key)
      }
    });
    var isMatch = viewedUserLikedUsersArray.indexOf(_LOGGED_IN_USER[0].useruid);
    if (isMatch >=0){
      console.log('is match');
      _MATCHES.push(_ARRAY_OF_FUTURE_USERS[0]);
      console.log(_MATCHES, 'array time');
      makeAMatch(_LOGGED_IN_USER[0].useruid, _ARRAY_OF_FUTURE_USERS[0].useruid);
      retrieveMatches();
    }
    else {
      console.log('no match');
    }
},

viewingSex: function(){
  var chosenSex = 'male';
  var viewedUserGender = firebase.database().ref('users/' + _ARRAY_OF_FUTURE_USERS[0].useruid + '/gender');
  viewedUserGender.on('value', function(snapshot) {
    for (var i=0; i<_ARRAY_OF_FUTURE_USERS.length; i++) {
      if (chosenSex == snapshot.val()){
        console.log('here');
        _ARRAY_OF_FUTURE_USERS.splice(_ARRAY_OF_FUTURE_USERS[i].useruid)
      }
      else {
        console.log('did not work');
      }
    }
  })
},

unMatch: function(){
    var viewed_user_object = _USERS[0];
    var unMatchUserViewedByLoggedInUser = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/matches/' + viewed_user_object.useruid);
    var unMatchAndUnlikeUserViewedByLoggedInUser = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/liked_users/' + viewed_user_object.useruid);
    var unMatchLoggedInUser = firebase.database().ref('users/' + viewed_user_object.useruid + '/matches/' + _LOGGED_IN_USER[0].useruid);
    var unMatchAndUnlikeLoggedInUser = firebase.database().ref('users/' + viewed_user_object.useruid + '/liked_users/' + _LOGGED_IN_USER[0].useruid);
    unMatchUserViewedByLoggedInUser.remove();
    unMatchAndUnlikeUserViewedByLoggedInUser.remove();
    unMatchLoggedInUser.remove();
    unMatchAndUnlikeLoggedInUser.remove();
},

fetchMatches: function(){
  var displayListOfMatches = document.getElementById('matches');
  var viewMatches = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/matches');
  var viewMatchesArray = [];
  viewMatches.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        viewMatchesArray.push(key)
      }
  });
  return viewMatchesArray;
},


makeHTMLMatchesTable: function(array){
  var table = document.createElement('table');
    for (var i = 0; i < array.length; i++) {
      var row = document.createElement('tr');
      var cell = document.createElement('td');
      cell.textContent = array[i];
      row.appendChild(cell);
      cell = document.createElement('td');
      var unMatchButton = document.createElement('button');
      var msgButton = document.createElement('button');
      unMatchButton.setAttribute("id", "unMatchButton" +i);
      msgButton.setAttribute("id", "msgButton" +i);
      unMatchButton.textContent = "unmatch";
      msgButton.textContent = "message";
      unMatchButton.addEventListener("click", unMatchButtonClicked, false);
      msgButton.addEventListener("click", messageUser, false);
      cell.appendChild(unMatchButton);
      cell.appendChild(msgButton)
      row.appendChild(cell);
      table.appendChild(row);
    }
    return table;
},

unMatchButtonClicked: function(){
  this.parentNode.parentNode.remove();
  unMatch();
},

messageUser: function() {
  document.location.replace('./logged_in/messaging');
},
getInitialState: function(){

},
componentDidMount: function(){

},
render: function() {
  return (
    <div className="dateApp">
      <h1> Comments </h1>
    </div>
  );
}
});

// ReactDOM.render(
//   <DateApp />, document.getElementById('content')
// );
