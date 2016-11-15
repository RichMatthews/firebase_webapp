import { rootRef, firebase_init } from './firebase_config.js';
import React from 'react';
import ReactDOM from 'react-dom';
import './logged_in.scss';
//import removePastLikedUsersFromFutureUsersArray from './removePastLikedUsers';
//import removePastDisLikedUsersFromFutureUsersArray from './removePastDislikedUsers';
var firebase = require('firebase');
var _ = require('lodash');

var DateApp = React.createClass({

  getInitialState: function(){
    return{
      all_users: {},
      past_users: {},
      future_users: [],
      matchesArray: [],
      messagesArray : [],
      messagingUseruid: '',
      likeAndDislikeDisableMent: 'disabled',
      messaging: false
    }
  },

  componentDidMount: function(){
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
            var loggedInUserObject = users_array[i];
          };
        }
        this.setState({loggedInUserObject: loggedInUserObject})
        if (loggedInUserObject.useruid === cookie_value){
            var index = this.state.future_users.indexOf(loggedInUserObject)
            this.state.future_users.splice(index, 1);
        };
        this.fetchMatches();
        this.welcomeTheUser();
        this.removePastLikedUsersFromFutureUsersArray();
        this.removePastDisLikedUsersFromFutureUsersArray();
        this.retrieveMessages();
      });
  },

  welcomeTheUser: function(loggedInUserObject){
    var welcomeUser = document.getElementById('welcome');
    var users = this.state.all_users;
    var loggedInUser = this.state.loggedInUserObject;
    welcomeUser.innerHTML = "Welcome " + loggedInUser.name;
  },

  uploadImage: function(){
    var uploadImageButton = document.getElementById('uploadImage');

    uploadImageButton.addEventListener('change', function(e){
      var file = e.target.files[0];
      var storageRef = storage.ref('pictures/' + file.name);
      var task = storageRef.put(file);
    });
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

likeButtonClicked: function(){
  var loggedInUser = this.state.loggedInUserObject;
  var futureUsers = this.state.future_users;
  var futureUserBeingViewed = this.state.future_users[0];
  this.liked(loggedInUser.useruid, futureUserBeingViewed.useruid, futureUserBeingViewed.name);
  this.isItAMatch();
  this.removePastLikedUsersFromFutureUsersArray();
  this.removePastDisLikedUsersFromFutureUsersArray();
  this.fetchMatches();
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

 dislikeButtonClicked: function(){
   var loggedInUser = this.state.loggedInUserObject;
   var futureUsers = this.state.future_users;
   var futureUserBeingViewed = this.state.future_users[0];
   this.disliked(loggedInUser.useruid, futureUserBeingViewed.useruid, futureUserBeingViewed.name);
   this.removePastLikedUsersFromFutureUsersArray();
   this.removePastDisLikedUsersFromFutureUsersArray();
   this.fetchMatches();
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

makeAMatch: function(useruid, username, likedUseruid, likedUserName){
  var postData = {
    likedUseruid: likedUseruid,
    likedUserName: likedUserName
  };
  var postData2 = {
    likedUseruid: useruid,
    likedUserName: username
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
      this.makeAMatch(loggedInUser.useruid, loggedInUser.name, this.state.future_users[0].useruid, this.state.future_users[0].name);
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

unMatch: function(viewedUseruid){
  var loggedInUser = this.state.loggedInUserObject;
  var unMatchUserViewedByLoggedInUser = firebase.database().ref('users/' + loggedInUser.useruid + '/matches/' + viewedUseruid);
  var unMatchAndUnlikeUserViewedByLoggedInUser = firebase.database().ref('users/' + loggedInUser.useruid + '/liked_users/' + viewedUseruid);
  var unMatchLoggedInUser = firebase.database().ref('users/' + viewedUseruid + '/matches/' + loggedInUser.useruid);
  var unMatchAndUnlikeLoggedInUser = firebase.database().ref('users/' + viewedUseruid + '/liked_users/' + loggedInUser.useruid);
  unMatchUserViewedByLoggedInUser.remove();
  unMatchAndUnlikeUserViewedByLoggedInUser.remove();
  unMatchLoggedInUser.remove();
  unMatchAndUnlikeLoggedInUser.remove();
  this.fetchMatches();
},

pullMatchesFromDB: function(query){
  return new Promise((resolve, reject) => {
      firebase.database().ref(query).on('value', resolve);
    })
},

fetchMatches: function(){
  var loggedInUser = this.state.loggedInUserObject;
  this.pullMatchesFromDB('/users/' + loggedInUser.useruid + '/matches/').then((all_matches) => {
    var matchesArray = Object.keys(all_matches.val()).map(function(key) {
      return all_matches.val()[key];
    });
    this.setState({matchesArray: matchesArray});
  })
},

unMatchButtonClicked: function(useruid){
  var loggedInUser = this.state.loggedInUserObject;
  this.unMatch(useruid);
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

sendMessageButtonClicked: function(viewedUseruid){
  console.log(viewedUseruid, '-++-');
  var loggedInUser = this.state.loggedInUserObject;
  var databaseRefSender = firebase.database().ref().child('users/' + loggedInUser.useruid + '/messages/' + viewedUseruid);
  var databaseRefReceiver = firebase.database().ref().child('users/' + viewedUseruid + '/messages/' + loggedInUser.useruid);
  var messageBodyValue = document.getElementById('message').value;
  var senderChat = {name: loggedInUser.name, message: messageBodyValue}
  databaseRefSender.push(senderChat);
  databaseRefReceiver.push(senderChat);
  this.retrieveMessages();
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

handleUseruidValue: function(uid){
    this.setState({uid: uid})
  },

onClick: function(uid) {
  this.setState({ messaging: true });
  this.setState({ uid: uid });
},


render: function() {
  return (
    <div className="dateApp">
      <p><span id="users"></span></p>
      <div id="buttons"></div>
      <p> Users </p>
      <p> {this.displayUser()} </p>
      <input type="submit" id="like" disabled={this.state.likeAndDislikeDisableMent.length < 0} value="like" onClick={() => this.likeButtonClicked(this.removePastLikedUsersFromFutureUsersArray, this.removePastDisLikedUsersFromFutureUsersArray)}/>
      <input type="submit" id="dislike" disabled={this.state.likeAndDislikeDisableMent.length < 0} value="dislike" onClick={() => this.dislikeButtonClicked(this.removePastLikedUsersFromFutureUsersArray, this.removePastDisLikedUsersFromFutureUsersArray)}/>
      <input type="submit" id="testButton" value="testButton" onClick={this.onClick} />
      <input type="submit" id="femaleOnly" value="femaly only" onClick={this.onClick} />
      <input type="submit" id="logOut" value="Log Out" />
      <form onSubmit={this.uploadImage}>
        <input type="file" id="uploadImage" value="Select Image" />
      </form>
      {
        this.state.messaging
        ? <Messaging uid={this.state.uid} loggedInUserProp={this.state.loggedInUserObject}/>
        :
        <div>
          <h3> Matches </h3>
            <table>
              <tbody>
                {this.state.matchesArray.map(function(num, index){
                  return <tr key={ index }>{num.likedUserName}
                  <input type="submit" value="Unmatch User" onClick={() => this.unMatchButtonClicked(num.likedUseruid)}/>
                  <input type="submit" value="Message User" onClick={() => this.onClick(num.likedUseruid)}/>
                  <input type="submit" id="message" onClick={() => this.sendMessageButtonClicked(this.state.uid)}/>
                  </tr>;
                }, this)}
              </tbody>
            </table>
        </div>
      }
    </div>
  );
}
});

var Messaging = React.createClass({

  getInitialState: function(){
    return{
      messagesArray : []
    }
  },

  componentDidMount: function(){
    this.retrieveMessages();
  },

  sendMessageButtonClicked: function(viewedUseruid){
    console.log(viewedUseruid, '-++-');
    var loggedInUser = this.props.loggedInUserProp;
    console.log(loggedInUser, 'liu');
    var databaseRefSender = firebase.database().ref().child('users/' + loggedInUser.useruid + '/messages/' + viewedUseruid);
    var databaseRefReceiver = firebase.database().ref().child('users/' + viewedUseruid + '/messages/' + loggedInUser.useruid);
    var messageBodyValue = document.getElementById('messsageText').value;
    var senderChat = {name: loggedInUser.name, message: messageBodyValue}
    databaseRefSender.push(senderChat);
    databaseRefReceiver.push(senderChat);
    this.retrieveMessages();
  },

  pullMessagesFromDB: function(query){
    return new Promise((resolve, reject) => {
        firebase.database().ref(query).on('value', resolve);
      })
  },

  retrieveMessages: function(){
    let loggedInUser = this.props.loggedInUserProp;
    let viewedUseruid = this.props.uid;
    this.pullMessagesFromDB('/users/' + loggedInUser.useruid + '/messages/' + viewedUseruid).then((all_messages) => {
      var messagesArray = Object.keys(all_messages.val()).map(function(key) {
        return all_messages.val()[key];
      });
      this.setState({messagesArray: messagesArray});
    })
  },

  render: function(){
    return (
      <div>
          <h3>You are messaging {this.props.uid}</h3>
          <div>
            <p id='msgs'>
              {this.state.messagesArray.map(function(num, index){
                return <p key={ index }>{num.name}: {num.message}</p>;
              }, this)}
            </p>
            <input type="text" id="messsageText"/>
            <input type="submit" value="Send" onClick={() => this.sendMessageButtonClicked(this.props.uid)}/>
          </div>
      </div>
    )
  }

});
ReactDOM.render(
  <DateApp />, document.getElementById('content')
);
