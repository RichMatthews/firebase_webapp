import { rootRef, firebase_init } from './firebase_config.js';

var firebase = require('firebase');
document.getElementById("go-through-users").onclick = nextUser
document.getElementById('revealUser').onclick = displayDaUsers
document.getElementById('like').onclick = likeButtonClicked
//document.getElementById('dislike').onclick = removeLoggedInUserFromViewingSelf
document.getElementById('dislike').onclick = dislikeButtonClicked
//document.getElementById('testButton').onclick = mapUidToUser
document.getElementById('testButton').onclick = displayRemovedPastUsersFromArray

// app state
var _USERS = [];
var _LOGGED_IN_USERS = [];
var _CURRENT_POTENTIAL_USER = {};

function displayDaUsers(){
  pullAllUsersFromDB().then(function(users_array){
    _USERS = users_array;
    console.log(_USERS);
  })
}

function pullAllUsersFromDB(){
   return new Promise(function(resolve, reject){
      rootRef.child('users').on('value', function(snapshot) {
      var users_object = snapshot.val();
      var users_array = Object.keys(users_object).map(function(key) {
        return users_object[key];
      });
      resolve(users_array)
    });
   })
}

function onChildValue(rootRef, value) {
  return new Promise(function(resolve, reject){
    rootRef.child(route).on('value', resolve);
  })
}

function removeLoggedInUserFromViewingSelf(){
  pullAllUsersFromDB().then(function(users_array){
    var cookie_value = document.cookie.split('=')[1];
    for (var i = 0; i < _USERS.length; i++) {
      if (_USERS[i].useruid == cookie_value){
        _USERS.splice(i, 1);
        break;
      }
    }
  })
}


var myIndex = 0;
var printUser = document.getElementById('displayUsers');
function nextUser(users_array) {
  printUser.innerHTML = _USERS[myIndex++ % _USERS.length].useruid
}

function likeButtonClicked(){
    pullAllUsersFromDB().then(function(users_array){
      var cookie_value = document.cookie.split('=')[1];
      for (var i = 0; i < _USERS.length; i++) {
        if (_USERS[i].useruid == cookie_value){
          var logged_in_user = _USERS[i].useruid;
        }
      }
      mapUidToUser().then(function(displayed_user){
        liked(logged_in_user, displayed_user.useruid, displayed_user.name)
      })
    })
}

function dislikeButtonClicked(){
    pullAllUsersFromDB().then(function(users_array){
      var cookie_value = document.cookie.split('=')[1];
      for (var i = 0; i < _USERS.length; i++) {
        if (_USERS[i].useruid == cookie_value){
          var logged_in_user = _USERS[i].useruid;
        }
      }
      mapUidToUser().then(function(displayed_user){
        disliked(logged_in_user, displayed_user.useruid, displayed_user.name)
      })
    })
}

function mapUidToUser(){
  return new Promise(function(resolve, reject){
    pullAllUsersFromDB().then(function(users_array){
      var userUidDisplayedValue = document.getElementById('displayUsers').innerHTML;
      console.log(userUidDisplayedValue);
      for (var i = 0; i < _USERS.length; i++) {
        if (userUidDisplayedValue == _USERS[i].useruid){
          var displayed_user = _USERS[i];
        }
      }
      resolve(displayed_user)
    })
  })
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

// function removePastUsersFromArray(){
//   return new Promise(function(resolve, reject){
//     pullAllUsersFromDB().then(function(users_array){
//       var cookie_value = document.cookie.split('=')[1];
//       for (var i = 0; i < _USERS.length; i++) {
//         if (_USERS[i].useruid == cookie_value){
//           var logged_in_user = _USERS[i].useruid;
//           rootRef.child('users/' + logged_in_user + '/disliked_users/').on('value', function(snapshot) {
//             var users_object = snapshot.val();
//             var dislikedUsersArray = Object.keys(users_object).map(function(key) {
//               return users_object[key];
//             });
//             resolve(dislikedUsersArray)
//             console.log('--disliked---');
//             console.log(dislikedUsersArray);
//           });
//           rootRef.child('users/' + logged_in_user + '/liked_users/').on('value', function(snapshot) {
//             var users_object = snapshot.val();
//             var likedUsersArray = Object.keys(users_object).map(function(key) {
//               return users_object[key];
//             });
//             resolve(likedUsersArray)
//             console.log('---liked---');
//             console.log(likedUsersArray);
//           });
//         }
//       }
//     })
//   })
// }

function removePastUsersFromArray(){
  pullAllUsersFromDB().then(function(users_array){
  var cookie_value = document.cookie.split('=') [1];
  const promises = []
    for (var i = 0; i < _USERS.length; i++) {
      if (_USERS[i].useruid == cookie_value){
      var logged_in_user = _USERS[i].useruid;
        promises.push(
          onChildValue(rootRef, 'users/' + logged_in_user + '/disliked_users/').then(formatUsers)
        )
        promises.push(
          onChildValue(rootRef, 'users/' + logged_in_user + '/liked_users/').then(formatUsers)
        )
      }
    }
  return Promise.all(promises);
  })
};

function formatUsers(snapshot){
    var users_object = snapshot.val();
    var users_array = Object.keys(users_object).map(function(key) {
      return users_object[key];
    });
    return users_array
}

function onChildValue(rootRef, route) {
   return new Promise(function(resolve, reject){
      rootRef.child(route).on('value', resolve);
   })
}


function displayRemovedPastUsersFromArray(){
  removePastUsersFromArray().then(function(promises){
    // var likedAndDislikedUsersArray = dislikedUsersArray.concat(likedUsersArray);
    // console.log('!!!!!!!');
    // console.log(dislikedUsersArray);
    // console.log(likedUsersArray);
    console.log(promises[0]);
      for (var i = 0; i < promises[0].length; i++){
        if (_USERS[i].useruid == "BLRlXKIeWkanHiSCXbBCFRTIaqk1"){
          console.log('im here');
          console.log(_USERS[i]);
          break;
        }
        else{
          console.log('not here');
        }
    }
  })
}
