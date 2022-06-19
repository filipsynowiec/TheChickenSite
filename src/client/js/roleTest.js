let csloggerRoleTest = new CSLogger("RoleTestClient");

document.getElementById("logOutButton").onclick = function () {
  logOut();
};

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
  getUserData()
    .then((data) => {
      csloggerRoleTest.info(`My name is ${data.name}, my id is ${data.userId}.`);
    })
    .catch((err) => {
      csloggerRoleTest.info(`I don't have a name.`);
    });
};

const getUrl = function (url) {
  let xhr = new XMLHttpRequest();
  let token = localStorage.getItem("token");
  xhr.open("GET", url, true);
  xhr.setRequestHeader("x-access-token", "Bearer " + token);
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      csloggerRoleTest.info(xhr.responseText);
    }
  };
  xhr.send();
};
