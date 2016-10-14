import { rootRef, firebase_init } from './firebase_config.js';

var firebase = require('firebase');
var _ = require('lodash');

// app state
var _USERS = [];
var _ARRAY_OF_PAST_USERS = [];
var _ARRAY_OF_FUTURE_USERS = [];
var _LOGGED_IN_USER = [];
var _MATCHES = [];

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
    removePastDisLikedUsersFromFutureUsersArray(users_array);
    //displayMatches();
    displayNextUser();
    retrieveMatches();
    //return _USERS;
  })


document.getElementById('like').onclick = function(){ return likeButtonClicked(_USERS[0]); }
document.getElementById('dislike').onclick = function(){ return dislikeButtonClicked(_USERS[0]); }
// document.getElementById('unMatchButton').onclick = function(){ return unMatch(); }
//document.getElementById('logOut').onclick = displayRemovedPastUsersFromArray

function retrieveMatches(){
  var tableResult = makeHTMLMatchesTable(fetchMatches());
  var matches = document.getElementById('matches')
  matches.parentNode.insertBefore(tableResult, matches);
}

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
  for (var i = 0; i < _USERS.length; i++) {
    if (_USERS[i].useruid != _LOGGED_IN_USER[0].useruid){
      _ARRAY_OF_FUTURE_USERS.push(_USERS[i]);
    }
  }
}

// function getPastLikedUsers(){
//   var pastLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/liked_users');
//   var pastLikedUsersArray = [];
//     pastLikedUsers.on('value', function(snapshot) {
//       for (var key in snapshot.val()){
//         pastLikedUsersArray.push(key)
//       }
//     });
//   console.log(pastLikedUsersArray, 'plua');
//   return pastLikedUsersArray;
// }

function removePastLikedUsersFromFutureUsersArray(){
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
}

function removePastDisLikedUsersFromFutureUsersArray(){
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

}

function onChildValue(rootRef, route) {
   return new Promise(function(resolve, reject){
      rootRef.child(route).on('value', resolve);
   })
}

function removeDecidedUserFromArray(user){
  _ARRAY_OF_FUTURE_USERS.splice(user, 1)
  _ARRAY_OF_PAST_USERS.push(user)
};

var myIndex = 0;
var printUser = document.getElementById('displayUsers');
function displayNextUser() {
  if (_ARRAY_OF_FUTURE_USERS.length > 0){
    printUser.innerHTML = _ARRAY_OF_FUTURE_USERS[0].name
  }
  else {
    document.getElementById("like").disabled = true;
    document.getElementById("dislike").disabled = true;
    printUser.innerHTML = 'You are out of people';
  }
}



function likeButtonClicked(user, users_array){
  user = _ARRAY_OF_FUTURE_USERS[0];
  var logged_in_user = _LOGGED_IN_USER[0]
    liked(logged_in_user.useruid, user.useruid, user.name);
    isItAMatch(logged_in_user.useruid, _ARRAY_OF_FUTURE_USERS);
    removeDecidedUserFromArray(user.useruid);
    displayNextUser();
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
  var logged_in_user = _LOGGED_IN_USER[0];
    disliked(logged_in_user.useruid, user.useruid, user.name);
    removeDecidedUserFromArray(user.useruid);
    displayNextUser();
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

function makeAMatch(useruid, likedUseruid){
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
}

function isItAMatch(logged_in_user, _ARRAY_OF_FUTURE_USERS){
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
      _MATCHES.push(_ARRAY_OF_FUTURE_USERS[0])
      console.log(_MATCHES, 'array time');
      makeAMatch(_LOGGED_IN_USER[0].useruid, _ARRAY_OF_FUTURE_USERS[0].useruid)
    }
    else {
      console.log('no match');
    }
}

function viewingSex(){
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
}

function unMatch(){
    var unMatchUserViewedByLoggedInUser = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/matches/' + 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2');
    var unMatchLoggedInUser = firebase.database().ref('users/' + 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2' + '/matches/' + _LOGGED_IN_USER[0].useruid);
    unMatchUserViewedByLoggedInUser.remove();
    unMatchLoggedInUser.remove();
};

var displayListOfMatches = document.getElementById('matches');
function fetchMatches(){
  var viewMatches = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/matches');
  var viewMatchesArray = [];
  viewMatches.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        viewMatchesArray.push(key)
      }
    });
    return viewMatchesArray;
  }


function makeHTMLMatchesTable(array){
  var table = document.createElement('table');
    for (var i = 0; i < array.length; i++) {
      var row = document.createElement('tr');
      var cell = document.createElement('td');
      cell.textContent = array[i];
      row.appendChild(cell);
    cell = document.createElement('td');
      var button = document.createElement('button');
      button.setAttribute("id", "unMatchButton" +i);
      cell.appendChild(button);
      row.appendChild(cell);
      table.appendChild(row);
    }
    return table;
}

function unMatchButtonClicked(){
  var button = document.getElementById('unmatch').onclick;

}


  // var viewedUserLikedUsers = firebase.database().ref('users/' + 'yC4jQuIgZKcU9wS7uo1xdsvruFh2' + '/liked_users');
  // var loggedInLikedUsers = firebase.database().ref('users/' + _LOGGED_IN_USER[0].useruid + '/liked_users');
  // var viewedUserLikedUsersArray = [];
  // var loggedInLikedUsersArray = [];
  // viewedUserLikedUsers.on('value', function(snapshot) {
  //     for (var key in snapshot.val()){
  //       viewedUserLikedUsersArray.push(key)
  //     }
  //   });
  // loggedInLikedUsers.on('value', function(snapshot) {
  //     for (var key in snapshot.val()){
  //       loggedInLikedUsersArray.push(key)
  //     }
  //   });
  //   for (var i=0; i < viewedUserLikedUsersArray.length; i++) {
  //      if (loggedInLikedUsersArray.indexOf(viewedUserLikedUsersArray[i].useruid) != -1) {
  //         i--;
  //      }
  //   }
  //var a = _.intersection(viewedUserLikedUsersArray, loggedInLikedUsersArray);
  // console.log(_MATCHES, 'matches');
  // _MATCHES.forEach(function(entry) {
  //   var p = document.createElement("p");
  //   p.appendChild(document.createTextNode(entry));
  //   displayListOfMatches.appendChild(p);
  // });



//
// function returnAllUsersDetails(){
//   const promises = []
//   promises.push(
//     onChildValue(rootRef, 'users/' + _USERS[0].useruid + '/liked_users/').then(formatUsers)
//   )
//   return Promise.all(promises);
//   console.log('promises', promises);
// }
//
// function removePastUsersFromArray(){
//   const promises = []
//   var logged_in_user = _LOGGED_IN_USER[0].useruid
//     promises.push(
//       onChildValue(rootRef, 'users/' + logged_in_user + '/disliked_users/').then(formatUsers)
//     )
//     promises.push(
//       onChildValue(rootRef, 'users/' + logged_in_user + '/liked_users/').then(formatUsers)
//     )
//     return Promise.all(promises);
// };

// function userMatch(users, key, userId) {
//   return users.find(function(user) {
//     return user[key] === userId;
//   })
// }
//
//
//
// function compareUsersLists(users, matchingUsers){
//   return users.filter(function(user){
//       return (
//         !userMatch(matchingUsers, 'dislikedUseruid', user.userUid)
//          && !userMatch(matchingUsers, 'likedUseruid', user.userUid)
//        )
//     });
// }
//
// function getFutureUsers(users){
//   return displayRemovedPastUsersFromArray()
//     .then(function(pastUsers){
//       return compareUsersLists(users, pastUsers) //returns array of users and array of past users
//     })
// }
//
// function logOut(){
//   var cookies = document.cookie.split(";");
//     for (var i = 0; i < cookies.length; i++) {
//     	var cookie = cookies[i];
//     	var eqPos = cookie.indexOf("=");
//     	var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//     	document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
//
//   _USERS = [];
//   _LOGGED_IN_USER = [];
//
// }
