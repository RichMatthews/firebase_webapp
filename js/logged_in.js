import { rootRef, firebase_init } from './firebase_config.js';

var firebase = require('firebase');
var _ = require('lodash');

// app state
var _USERS = [];
var _ARRAY_OF_PAST_USERS = [];
var _ARRAY_OF_FUTURE_USERS = [];
var _LOGGED_IN_USER = [];

function pullAllUsersFromDB(){
   return onChildValue(rootRef, 'users').
   then(formatUsers)
 }

pullAllUsersFromDB()
  .then(function(users_array){
    _USERS = users_array;
    welcomeTheUser(users_array);
    addUsersToFutureUsers(users_array, _LOGGED_IN_USER);
    removePastLikedUsersFromFutureUsersArray();
    removePastDisLikedUsersFromFutureUsersArray();
    displayNextUser(_ARRAY_OF_FUTURE_USERS);
    console.log(_USERS, 'users');
    console.log(_ARRAY_OF_FUTURE_USERS, 'aofu');
    console.log(_LOGGED_IN_USER);
    return _USERS;
  })


document.getElementById('like').onclick = function(){ return likeButtonClicked(_USERS[0]); }
document.getElementById('dislike').onclick = function(){ return dislikeButtonClicked(_USERS[0]); }
//document.getElementById('logOut').onclick = displayRemovedPastUsersFromArray
//document.getElementById('testButton').onclick = removePastUsersFromFutureUsersArray

var welcomeUser = document.getElementById('welcome');
function welcomeTheUser(users_array){
  var cookie_value = document.cookie.split('=')[1];
    for (var i = 0; i < _USERS.length; i++) {
      if (_USERS[i].useruid == cookie_value){
        var logged_in_user_object = _USERS[i];
        welcomeUser.innerHTML = "Welcome " + logged_in_user_object.name;
        _LOGGED_IN_USER.push(logged_in_user_object)
      }
    }
}

function formatUsers(snapshot){
  var users_object = snapshot.val();
  var users_array = Object.keys(users_object).map(function(key) {
    return users_object[key];
  });
  return users_array //return is [Object, Object, Object, Object]
}

function addUsersToFutureUsers(users_array, _LOGGED_IN_USER){
  for (var i = 0; i < users_array.length; i++) {
    if (users_array[i].useruid != _LOGGED_IN_USER[0].useruid){
      console.log(users_array[i].useruid);
      _ARRAY_OF_FUTURE_USERS.push(users_array[i]);
    }
  }
}

function getPastLikedUsers(){
  var pastLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/liked_users');
  var pastLikedUsersArray = [];
    pastLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        pastLikedUsersArray.push(key)
      }
    });
  return pastLikedUsersArray;
}

function removePastLikedUsersFromFutureUsersArray(){
  var pastLikedUsers = getPastLikedUsers();
  for (var i = 0; i < _ARRAY_OF_FUTURE_USERS.length; i++) {
    for (var j = 0; j < pastLikedUsers.length; j++) {
      if (_ARRAY_OF_FUTURE_USERS[i].useruid == pastLikedUsers[j]){
        _ARRAY_OF_FUTURE_USERS.splice(pastLikedUsers[j], 1);
      }
    }
  }
}

function getPastDisLikedUsers(){
  var pastDisLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/disliked_users');
  var pastDisLikedUsersArray = [];
  pastDisLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        pastDisLikedUsersArray.push(key)
      }
    });
  return pastDisLikedUsersArray;
}



function removePastDisLikedUsersFromFutureUsersArray(){
  var pastDisLikedUsers = getPastDisLikedUsers();
  for (var i = 0; i < _ARRAY_OF_FUTURE_USERS.length; i++) {
    for (var j = 0; j < pastDisLikedUsers.length; j++) {
      if (_ARRAY_OF_FUTURE_USERS[i].useruid == pastDisLikedUsers[j]){
        _ARRAY_OF_FUTURE_USERS.splice(pastDisLikedUsers[j], 1);
      }
    }
  }
}

function onChildValue(rootRef, route) {
   return new Promise(function(resolve, reject){
      rootRef.child(route).on('value', resolve);
   })
}

function userMatch(users, key, userId) {
  return users.find(function(user) {
    return user[key] === userId;
  })
}



function compareUsersLists(users, matchingUsers){
  return users.filter(function(user){
      return (
        !userMatch(matchingUsers, 'dislikedUseruid', user.userUid)
         && !userMatch(matchingUsers, 'likedUseruid', user.userUid)
       )
    });
}

function getFutureUsers(users){
  return displayRemovedPastUsersFromArray()
    .then(function(pastUsers){
      return compareUsersLists(users, pastUsers) //returns array of users and array of past users
    })
}



function removeDecidedUserFromArray(user){
  _ARRAY_OF_FUTURE_USERS.splice(user, 1)
  _ARRAY_OF_PAST_USERS.push(user)
};

var myIndex = 0;
var printUser = document.getElementById('displayUsers');
function displayNextUser(_ARRAY_OF_FUTURE_USERS) {
  if (_ARRAY_OF_FUTURE_USERS.length > 0){
    printUser.innerHTML = _ARRAY_OF_FUTURE_USERS[0].useruid
  }
  else {
    document.getElementById("like").disabled = true;
    document.getElementById("dislike").disabled = true;
    printUser.innerHTML = 'You are out of people';
  }
}


function returnAllUsersDetails(){
  const promises = []
  promises.push(
    onChildValue(rootRef, 'users/' + _USERS[0].useruid + '/liked_users/').then(formatUsers)
  )
  return Promise.all(promises);
  console.log('promises', promises);
}

function removePastUsersFromArray(){
  const promises = []
  var logged_in_user = _LOGGED_IN_USER[0].useruid
    promises.push(
      onChildValue(rootRef, 'users/' + logged_in_user + '/disliked_users/').then(formatUsers)
    )
    promises.push(
      onChildValue(rootRef, 'users/' + logged_in_user + '/liked_users/').then(formatUsers)
    )
    return Promise.all(promises);
};

function likeButtonClicked(user, users_array){
  user = _ARRAY_OF_FUTURE_USERS[0];
  var logged_in_user = _LOGGED_IN_USER[0]
    liked(logged_in_user.useruid, user.useruid, user.name);
    removeDecidedUserFromArray(user.useruid);
    displayNextUser(_ARRAY_OF_FUTURE_USERS);
    itsAMatch(logged_in_user);
}

function liked(useruid, likedUseruid, likedUserName){
  var postData = {
    likedUserName: likedUserName,
    likedUseruid: likedUseruid
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/liked_users/' + likedUseruid] = postData;
  return firebase.database().ref().update(updates);
}

function dislikeButtonClicked(user){
  user = _ARRAY_OF_FUTURE_USERS[0];
  var logged_in_user = _LOGGED_IN_USER[0]
    disliked(logged_in_user.useruid, user.useruid, user.name);
    removeDecidedUserFromArray(user.useruid)
    displayNextUser(_ARRAY_OF_FUTURE_USERS)
}

function disliked(useruid, dislikedUseruid, dislikedUserName){
  var postData = {
    dislikedUserName: dislikedUserName,
    dislikedUseruid: dislikedUseruid
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/disliked_users/' + dislikedUseruid] = postData;
  return firebase.database().ref().update(updates);
}

function itsAMatch(logged_in_user){
  if (logged_in_user.useruid == ){
    console.log("it's a match!");
  }
  else {
    console.log("it's not a match!");
  }
}


function logOut(){
  var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
    	var cookie = cookies[i];
    	var eqPos = cookie.indexOf("=");
    	var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    	document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

  _USERS = [];
  _LOGGED_IN_USER = [];

}
