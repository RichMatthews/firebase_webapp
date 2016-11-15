import React from 'react';

function removePastLikedUsersFromFutureUsersArray(){
  var loggedInUser = this.state.loggedInUserObject;
  var futureUsers = this.state.future_users;
  var pastLikedUsers = firebase.database().ref('users/' + loggedInUser.useruid + '/liked_users');
  var pastLikedUsersArray = [];
    pastLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        pastLikedUsersArray.push(key)
      }
    });
  for (var i=0; i<futureUsers.length; i++) {
     if (pastLikedUsersArray.indexOf(futureUsers[i].useruid) != -1) {
        futureUsers.splice(i, 1);
        i--;
     }
  }
  this.setState({future_users: futureUsers})
}

export default removePastLikedUsersFromFutureUsersArray;
