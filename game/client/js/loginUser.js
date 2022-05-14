let button = document.getElementById("loginButton");

button.onclick = function () {
  console.log("Login button pressed");
  let address = window.location.href;
  let params = {
    username: document.getElementById("login").value,
    password: document.getElementById("password").value,
    role: ["user"],
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
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("received answer");
      console.log(xhr.responseText);
      let JSONanswer = JSON.parse(xhr.responseText);
      localStorage.setItem("token", JSONanswer.accessToken);
    }
  };
  let data = JSON.stringify(params);
  xhr.send(data);
}
