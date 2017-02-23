// Initialize Firebase
var config = {
    apiKey: "AIzaSyB0cxqayUbjTNtHOc43_CDmXt-icWzIs7s",
    authDomain: "lyrics-training.firebaseapp.com",
    databaseURL: "https://lyrics-training.firebaseio.com",
    storageBucket: "lyrics-training.appspot.com",
    messagingSenderId: "266422210364"
};
firebase.initializeApp(config);


firebase.auth().signInWithEmailAndPassword("totally_secure@saintfactorstudios.com", "you dont even play piano").catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
});