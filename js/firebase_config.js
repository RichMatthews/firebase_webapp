const firebase = require('firebase');
var config = {
  apiKey: "AIzaSyCowDjjVIdmAf7FZroaeeB1VBgw3Ysodjo",
  authDomain: "my-cool-project-f0ee8.firebaseapp.com",
  databaseURL: "https://my-cool-project-f0ee8.firebaseio.com",
  storageBucket: "my-cool-project-f0ee8.appspot.com",
};
export const firebase_init = firebase.initializeApp(config);
export const rootRef = firebase.database().ref();
export const storage = firebase.storage();


// document.addEventListener("DOMContentLoaded", false);
