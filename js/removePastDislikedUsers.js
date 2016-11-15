import React from 'react';

function removePastDisLikedUsersFromFutureUsersArray(){
 var loggedInUser = this.state.loggedInUserObject;
 var futureUsers = this.state.future_users;
 var pastDisLikedUsers = firebase.database().ref('users/' + loggedInUser.useruid + '/disliked_users');
 var pastDisLikedUsersArray = [];
 pastDisLikedUsers.on('value', function(snapshot) {
     for (var key in snapshot.val()){
       pastDisLikedUsersArray.push(key)
     }
   });
 for (var i=0; i<futureUsers.length; i++) {
    if (pastDisLikedUsersArray.indexOf(futureUsers[i].useruid) != -1) {
       futureUsers.splice(i, 1);
       i--;
    }
 }
 this.setState({future_users: futureUsers});
}

export default removePastDisLikedUsersFromFutureUsersArray;
