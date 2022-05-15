let button = document.getElementById("registerButton");

button.onclick = function () {
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    roles: [document.getElementById("roles").value],
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
    }
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}
