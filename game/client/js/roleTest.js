document.getElementById("allButton").onclick = function () {
  changeUrl(window.location.href + "/all");
};
document.getElementById("userButton").onclick = function () {
  changeUrl(window.location.href + "/user");
};
document.getElementById("moderatorButton").onclick = function () {
  changeUrl(window.location.href + "/mod");
};
document.getElementById("adminButton").onclick = function () {
  changeUrl(window.location.href + "/admin");
};

const changeUrl = function (url) {
  let xhr = new XMLHttpRequest();
  let token = localStorage.getItem("token");
  console.log(url, token);
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send();
};
