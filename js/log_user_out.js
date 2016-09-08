var firebase = require('firebase');
import { rootRef, firebase_init } from '../firebase_config.js';

function logUserOut(){
  // todo: delete this code once using server side
  var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  firebase.auth().signOut().then(function() {
    console.log("Sign-out successful.");
  }, function(error) {
    console.log("An error happened.");
  });
}
