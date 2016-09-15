var firebase = require('firebase');
import { rootRef, firebase_init } from './firebase_config.js';

document.getElementById('signUpButton').onclick = signUserUp
document.getElementById('logInButton').onclick = logUserIn
function signUserUp(){
  var sign_up_username = document.getElementById('sign_up_username').value;
  var password = document.getElementById('sign_up_password').value;
  var name = document.getElementById('name').value;
  var gender = document.getElementById('gender').value;

  firebase.auth().createUserWithEmailAndPassword(sign_up_username, password).then(
    function(result){
      document.cookie = "useruid=" + result.uid + ";"
      writeUserData(name, result.uid, sign_up_username, gender)
      document.location.replace('./logged_in');
    },
    function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
      })
    };

    function writeUserData(name, useruid, username, gender){
      firebase.database().ref('/users/' + useruid).set({
        username: username,
        name: name,
        useruid: useruid,
        gender: gender
      });
    }

function logUserIn(){
  console.log('i was called');
  var email = document.getElementById('log_in_username').value;
  var password = document.getElementById('log_in_password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).then(
  function(result) {
    document.cookie = "useruid=" + result.uid + ";"
    document.location.replace('./logged_in');
  },
  function(error) {
    if (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage)
  }
  });
};
document.addEventListener("DOMContentLoaded", false);
