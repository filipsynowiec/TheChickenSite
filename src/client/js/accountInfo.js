let userInfo = document.getElementById("user-info");
function setUserName(username) {
  userInfo.innerHTML = '<a class="nav-link" href="/profile">' + username + '</a>';

}
function setNotLogedIn() {
  userInfo.innerHTML = '<a class="nav-link" href="/signin">Log in</a>';
}
getName(setUserName, setNotLogedIn);
