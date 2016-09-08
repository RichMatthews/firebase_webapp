var firebase = require('firebase');
import { rootRef, firebase_init } from '../firebase_config.js';
console.log('hey');

document.getElementById('signUpButton').onclick = signUserUp
function signUserUp(){
  console.log('i was called');
  var sign_up_username = document.getElementById('sign_up_username').value;
  var password = document.getElementById('sign_up_password').value;
  var name = document.getElementById('name').value;
  var gender = document.getElementById('gender').value;
  var liked;
  var not_liked;
  firebase.auth().createUserWithEmailAndPassword(sign_up_username, password).then(
    function(result){
      document.cookie = "useruid=" + result.uid + ";"
      writeUserData(name, result.uid, sign_up_username, gender, liked, not_liked)
      //document.location.replace('./logged_in');
    },
    function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
      })
    };

function logUserIn(){
  var email = document.getElementById('log_in_username').value;
  var password = document.getElementById('log_in_password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).then(
  function(result) {
    document.cookie = "useruid=" + result.uid + ";"
    //document.location.replace('./logged_in');
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
