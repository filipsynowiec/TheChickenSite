let userInfo = document.getElementById("user-info");

function setUserName(username) {
  userInfo.innerHTML = "Logged in as " + username;
}
function setNotLogedIn() {
  userInfo.innerHTML = "";
}
getName(setUserName, setNotLogedIn);