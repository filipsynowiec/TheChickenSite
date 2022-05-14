let button = document.getElementById("registerButton");

button.onclick = function () {
  console.log("Register button pressed");
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    role: [document.getElementById("roles").value],
  };
  post2(address, params);
};

function post2(url, params) {
  let xhr = new XMLHttpRequest();
  console.log(url);
  console.log(params);
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    console.log(xhr.responseText);
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}
