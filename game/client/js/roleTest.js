document.getElementById("allButton").onclick = function () {
  getUrl(window.location.href + "/all");
};
document.getElementById("userButton").onclick = function () {
  getUrl(window.location.href + "/user");
};
document.getElementById("moderatorButton").onclick = function () {
  getUrl(window.location.href + "/mod");
};
document.getElementById("adminButton").onclick = function () {
  getUrl(window.location.href + "/admin");
};

document.getElementById("nameButton").onclick = function () {
  getName((name) => {
    console.log(name);
  });
};

const getUrl = function (url) {
  let xhr = new XMLHttpRequest();
  let token = localStorage.getItem("token");
  console.log(url, token);
  xhr.open("GET", url, true);
  xhr.setRequestHeader("x-access-token", "Bearer " + token);
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      console.log("received answer");
      console.log(xhr.responseText);
    }
  };
  xhr.send();
};
