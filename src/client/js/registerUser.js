let csloggerRegister = new CSLogger("RegisterUserClient");

let button = document.getElementById("registerButton");
let signinLink = document.getElementById("signin-link");

button.onclick = function () {
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    role: document.getElementById("roles").value,
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
      csloggerRegister.info(xhr.responseText);
      if (this.status === 200) {
        window.location.href = "/signin";
      } else {
        let answer = JSON.parse(xhr.responseText);
        if (!answer.succesful) {
          Swal.fire("Register unsuccessfull", answer.message, "error");
        }
      }
    }
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}
signinLink.onclick = function () {
  window.location.href = "/signin";
};
