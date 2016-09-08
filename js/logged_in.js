var firebase = require('firebase');
import { rootRef, firebase_init } from './firebase_config.js';
//var usersRef = ref.orderByChild("/users/");

      function pullFromDB(){
        // usersRef.on('value', function(snapshot) {
         ref.child('users').on('value', function(snapshot) {
           var all_names = snapshot.val();
           for (var u in all_names){
             console.log(u.length);
             document.getElementById("users").innerHTML = u;
           }
          // var a = snapshot.numChildren();
          // console.log(a);
          // var b = snapshot.child("name");
          // console.log(b);
          // var c = snapshot.child("name/first").numChildren();
          // console.log(c);
          // snapshot.forEach(function(childSnapshot){
          //   var key = childSnapshot.key();
          //   console.log(key)
          //   var childData = childSnapshot.val();
          //   console.log(childData);
          // })
          function next_user(){
            //user = snapshot.val().users[i];
            // console.log(user);
            // console.log(snapshot.val().users[i]);
            // document.getElementById("users").innerHTML = snapshot.val().users.Mike.name;
            // document.getElementById("users").innerHTML = user;
            //  i++;
            }
          next_user();
        }), function (errorCode){
          console.log(errorCode);
        }
      }

    function liked(){
      console.log('here')
      var people_liked = [];
      var person = document.getElementById("users").value;
      people_liked.push(person)
      console.log(person);
      console.log(people_liked);
    }

    function disliked(){
      var people_unliked = [];
      people_unliked.push(useruid)
     }



document.addEventListener("DOMContentLoaded", false);
