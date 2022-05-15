let button = document.getElementById("registerButton");
let signinLink = document.getElementById("signin-link");

button.onclick = function () {
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    roles: [document.getElementById("roles").value],
  };
  post(address, params);
};

let signupSuccess = false;

function post(url, params) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.responseText);
    }
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      window.location.href = "/signin";
    }
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}
signinLink.onclick = function () {
  window.location.href = "/signin";
};