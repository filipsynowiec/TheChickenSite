let button = document.getElementById("loginButton");
let signupLink = document.getElementById("signup-link");

button.onclick = function () {
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    role: ["user"],
  };
  post(address, params);
};

function post(url, params) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.responseText);
      let JSONanswer = JSON.parse(xhr.responseText);
      if (JSONanswer.successful) {
        localStorage.setItem("token", JSONanswer.accessToken);
        window.location.href = "/";
      }
    }
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}

signupLink.onclick = function () {
  window.location.href = "/signup";
};
