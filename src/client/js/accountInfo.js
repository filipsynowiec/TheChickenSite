let userInfo = document.getElementById("user-info");
function setUserName(username) {
  userInfo.innerHTML = '<a class="nav-link nav-link-right" href="/profile">' + username + '</a>';

}
function setNotLogedIn() {
  userInfo.innerHTML = '<a class="nav-link nav-link-right" href="/signin">Log in</a>';
}

getUserData()
  .then((data) => {
    setUserName(data.name);
  })
  .catch((err) => {
    setNotLogedIn();
  });
