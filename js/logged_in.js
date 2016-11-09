import { rootRef, firebase_init } from './firebase_config.js';
import React from 'react';
import ReactDOM from 'react-dom';
import './logged_in.scss';
//import RemovePastUsers from './removePastUsers'
var firebase = require('firebase');
var _ = require('lodash');

// document.getElementById('like').onclick = function(){ return likeButtonClicked(_USERS[0]); }
// document.getElementById('dislike').onclick = function(){ return dislikeButtonClicked(_USERS[0]); }

var DateApp = React.createClass({

  getInitialState: function(){
    return{
      all_users: {},
      past_users: {},
      future_users: [],
      viewMatchesArray: [],
      messagesArray : [],
      likeAndDislikeDisableMent: 'disabled'
    }
  },

  componentDidMount: function(){

    // {this.state.future_users.map(function(item){
    //   return (<div>{item.name}</div>);
    // })}
    this.beginFunction();


  },


  pullAllUsersFromDB: function(query){
    return new Promise((resolve, reject) => {
        firebase.database().ref(query).on('value', resolve);
      })
  },

  beginFunction: function(){
    this.pullAllUsersFromDB('/users/').then((all_users) => {
      var users_array = Object.keys(all_users.val()).map(function(key) {
        return all_users.val()[key];
      });
      return users_array;
    })
    .then((users_array) => {
      this.setState({all_users: users_array});
      this.setState({past_users: []});
      this.setState({future_users: users_array});
        var cookie_value = document.cookie.split('=')[1];
        for (var i = 0; i < users_array.length; i++) {
          if (users_array[i].useruid == cookie_value){
            var logged_in_user_object = users_array[i];
          };
        }
        this.setState({loggedInUserObject: logged_in_user_object})
        if (logged_in_user_object.useruid === cookie_value){
            var index = this.state.future_users.indexOf(logged_in_user_object)
            this.state.future_users.splice(index, 1);
        };
        this.fetchMatches();
        this.welcomeTheUser();
        this.removePastLikedUsersFromFutureUsersArray();
        this.removePastDisLikedUsersFromFutureUsersArray();
        this.retrieveMessages();
      });
  },

  welcomeTheUser: function(logged_in_user_object){
    var welcomeUser = document.getElementById('welcome');
    var users = this.state.all_users;
    var loggedInUser = this.state.loggedInUserObject;
    welcomeUser.innerHTML = "Welcome " + loggedInUser.name;
  },

  removePastLikedUsersFromFutureUsersArray: function(){
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
  },


 removePastDisLikedUsersFromFutureUsersArray: function(){
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
},

removeDecidedUserFromArray: function(){
  this.state.future_users.shift();
},

displayNextUser: function() {
  // var myIndex = 0;
  // var printUser = document.getElementById('displayUsers');
  // if (_ARRAY_OF_FUTURE_USERS.length > 0){
  //   printUser.innerHTML = _ARRAY_OF_FUTURE_USERS[0].name
  // }
  if (this.state.future_users.length > 0) {
    document.getElementById("like").disabled = true;
    document.getElementById("dislike").disabled = true;
    printUser.innerHTML = 'You are out of people';
  }
},



likeButtonClicked: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var futureUsers = this.state.future_users;
  var futureUserBeingViewed = this.state.future_users[0];
  this.liked(loggedInUser.useruid, futureUserBeingViewed.useruid, futureUserBeingViewed.name);
  this.isItAMatch();
  this.removePastLikedUsersFromFutureUsersArray();
  this.removePastDisLikedUsersFromFutureUsersArray();
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

makeAMatch: function(useruid, likedUseruid, likedUserName){
  console.log('here');
  var postData = {
    likedUseruid: likedUseruid,
    likedUserName: likedUserName
  };
  var postData2 = {
    likeduseruid: useruid,
    likedUserName: likedUserName
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + useruid + '/matches/' + likedUseruid] = postData;
  updates['/users/' + likedUseruid + '/matches/' + useruid] = postData2;
  return firebase.database().ref().update(updates);
},

isItAMatch: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var viewedUserLikedUsers = firebase.database().ref('users/' + this.state.future_users[0].useruid + '/liked_users');
  var viewedUserLikedUsersArray = [];
  viewedUserLikedUsers.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        viewedUserLikedUsersArray.push(key)
      }
    });
    var isMatch = viewedUserLikedUsersArray.indexOf(loggedInUser.useruid);
    if (isMatch >=0){
      //_MATCHES.push(this.state.future_users[0]);
      this.makeAMatch(loggedInUser.useruid, this.state.future_users[0].useruid, this.state.future_users[0].name);
    }
},

viewingSex: function(){
  var chosenSex = 'male';
  var viewedUserGender = firebase.database().ref('users/' + this.state.future_users[0].useruid + '/gender');
  viewedUserGender.on('value', function(snapshot) {
    for (var i=0; i<this.state.future_users.length; i++) {
      if (chosenSex == snapshot.val()){
        _ARRAY_OF_FUTURE_USERS.splice(_ARRAY_OF_FUTURE_USERS[i].useruid)
      }
      else {
      }
    }
  })
},

unMatch: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var viewMatchesArray = this.state.viewMatchesArray;
  var unMatchUserViewedByLoggedInUser = firebase.database().ref('users/' + loggedInUser.useruid + '/matches/' + 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2');
  var unMatchAndUnlikeUserViewedByLoggedInUser = firebase.database().ref('users/' + loggedInUser.useruid + '/liked_users/' + 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2');
  //var unMatchLoggedInUser = firebase.database().ref('users/' + viewed_user_object.useruid + '/matches/' + _LOGGED_IN_USER[0].useruid);
  //var unMatchAndUnlikeLoggedInUser = firebase.database().ref('users/' + viewed_user_object.useruid + '/liked_users/' + _LOGGED_IN_USER[0].useruid);
  unMatchUserViewedByLoggedInUser.remove();
  unMatchAndUnlikeUserViewedByLoggedInUser.remove();
  //unMatchLoggedInUser.remove();
  //unMatchAndUnlikeLoggedInUser.remove();
  this.fetchMatches();
},

fetchMatches: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var displayListOfMatches = document.getElementById('matches');
  var viewMatches = firebase.database().ref('users/' + loggedInUser.useruid + '/matches/');
  var viewMatchesArray = [];
  viewMatches.on('value', function(snapshot) {
      for (var key in snapshot.val()){
        viewMatchesArray.push(key)
      }
  });
  this.setState({viewMatchesArray: viewMatchesArray});
},

unMatchButtonClicked: function(){
  var loggedInUser = this.state.loggedInUserObject;
  console.log(loggedInUser);
  //this.unMatch();
},

messageUser: function() {
  //document.location.replace('./logged_in/messaging');
  console.log('messaging hit');
  // {this.state.future_users.map(function(user, index){
  //   return <p key={ index }>{user.name} </p>;
  // }, this)}
},

displayUser : function(){
  if (this.state.future_users[0]){
    return this.state.future_users[0].name;
  }
  else{
    //this.setState({likeAndDislikeDisableMent: ''})
    return 'You are out of people';
  }
},

sendMessage: function(senderUseruid, senderName, receiverUseruid, receiverName, messageBody){
  var postData = {
    receiverUseruid: receiverUseruid,
    receiverName: receiverName,
    messageBody: messageBody
  };
  var postData2 = {
    senderUseruid: senderUseruid,
    senderName: senderName,
    messageBody: messageBody
  };
  var newPostKey = firebase.database().ref().child('users').push().key;
  var updates = {};
  updates['/users/' + senderUseruid + '/messages/' + receiverUseruid] = postData;
  updates['/users/' + receiverUseruid + '/messages/' + senderUseruid] = postData2;
  return firebase.database().ref().update(updates);
},

sendMessageButtonClicked: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var databaseRefSender = firebase.database().ref().child('users/' + loggedInUser.useruid + '/messages/');
  var databaseRefReceiver = firebase.database().ref().child('users/' + 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2' + '/messages/');
  var messageBodyValue = document.getElementById('message').value;
  var senderChat = {name: loggedInUser.name, message: messageBodyValue}
  databaseRefSender.push(senderChat);
  databaseRefReceiver.push(senderChat);
  this.retrieveMessages();

  // databaseRef.on('child_added', function(snapshot){
  // })
    // var messageElement = document.createTextNode(messageBodyValue);
    // var chat = snapshot.val();
    // var msg = document.getElementById('msgs');
    // //messageBodyValue.id = snapshot.key;
    // //this.sendMessage(loggedInUser.useruid, loggedInUser.name, 'PHS2DwlCZ0RJaylhJ0FNgEiNLug2', 'Lucy', chat.messageBodyValue);
    // //this.sendMessage(chat.messageBodyValue);
    // msg.appendChild(messageElement);
},

pullMessagesFromDB: function(query){
  return new Promise((resolve, reject) => {
      firebase.database().ref(query).on('value', resolve);
    })
},

retrieveMessages: function(){
  var loggedInUser = this.state.loggedInUserObject;
  this.pullMessagesFromDB('/users/' + loggedInUser.useruid + '/messages/').then((all_messages) => {
    var messagesArray = Object.keys(all_messages.val()).map(function(key) {
      return all_messages.val()[key];
    });
    this.setState({messagesArray: messagesArray});
  })
},

render: function() {
  return (
    <div className="dateApp">
      <p><span id="users"></span></p>
      <div id="buttons"></div>
      <p> Users </p>
      <p> {this.displayUser()} </p>
      <input type="submit" id="like" disabled={this.state.likeAndDislikeDisableMent.length < 0} value="like" onClick={() => this.likeButtonClicked()}/>
      <input type="submit" id="dislike" disabled={this.state.likeAndDislikeDisableMent.length < 0} value="dislike" onClick={() => this.dislikeButtonClicked()}/>
      <input type="submit" id="testButton" value="testButton" />
      <input type="submit" id="logOut" value="Log Out" />
      <h3> Matches </h3>
      <table>
        <tbody>
          {this.state.viewMatchesArray.map(function(num, index){
            return <tr key={ index }>{num}
            <input type="submit" value="unmatch" onClick={() => this.unMatchButtonClicked()}/>
            <input type="submit" value="message" onClick={() => this.messageUser()}/>
            </tr>;
          }, this)}
        </tbody>
      </table>
      <input type="text" id="message"/>
      <input type="submit" id="message" onClick={() => this.sendMessageButtonClicked()}/>
      <p id='msgs'>
        {this.state.messagesArray.map(function(num, index){
          return <p key={ index }>{num.name + ' '}{num.message}</p>;
        }, this)}
      </p>
    </div>
  );
}
});

ReactDOM.render(
  <DateApp />, document.getElementById('content')
);
