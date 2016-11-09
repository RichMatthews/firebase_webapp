import React from 'react';

removePastLikedUsersFromFutureUsersArray: function(future_users, logged_in_user_object){
  var pastLikedUsers = firebase.database().ref('users/' + logged_in_user_object.useruid + '/liked_users');
  var pastLikedUsersArray = [];
    pastLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        pastLikedUsersArray.push(key)
      }
    });
  for (var i=0; i<future_users.length; i++) {
     if (pastLikedUsersArray.indexOf(future_users[i].useruid) != -1) {
        future_users.splice(i, 1);
        i--;
     }
  }
  return future_users;
},
