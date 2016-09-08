var firebase = require('firebase');
// var ref = require('./app.js')
// var usersRef = ref.orderByChild("/users/");
// var firebase_init = require('../app.js');

document.getElementById('signUpButton').onclick = signUserUp
function signUserUp(){
  console.log('i am in');
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

    function writeUserData(name, useruid, username, gender, liked, not_liked){
          firebase.database().ref('/users/' + name).set({
            username: username,
            name: name,
            useruid: useruid,
            gender: gender,
            liked: 'liked',
            not_liked: 'liked'
          });
    }

  document.getElementById('logInButton').onclick = logUserIn
  function logUserIn(){
    console.log('hello');
    var email = document.getElementById('log_in_username').value;
    var password = document.getElementById('log_in_password').value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(
    function(result) {
      document.cookie = "useruid=" + result.uid + ";"
      document.location.replace('./welcome');
    },
    function(error) {
      if (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage)
    }
    });
  };
