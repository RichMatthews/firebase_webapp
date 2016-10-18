var firebase = require('firebase');
// var usersRef = ref.orderByChild("/users/");
var rootRef = firebase.database().ref();
user = rootRef.child(getCookie('useruid'));

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}


function whosignedin(user){
    if (user) {
      console.log(user + 'signed in');
    } else {
      console.log('no one signed in');
    }
};

submitToDB1.addEventListener('click', function() {
  if(document.getElementById('Hannah').checked){
    user.set({liked:["Hannah"]});
    console.log('checked');
  } else {
    console.log('not checked');
  }
});
