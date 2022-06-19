let csloggerRequests = new CSLogger("ServerRequests");

const serverRequest = function (url, params) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    let token = localStorage.getItem("token");
    xhr.open("GET", url + "?" + params, true);
    xhr.setRequestHeader("x-access-token", "Bearer " + token);
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        csloggerRequests.info(xhr.responseText);
        let JSONanswer;
        try {
          JSONanswer = JSON.parse(xhr.responseText);
        } catch (err) {
          reject(err);
          return;
        }
        if (this.status == 200 && JSONanswer.successful) {
          resolve(JSONanswer);
        } else {
          reject(new Error("Unsuccessful request"));
        }
      }
    };
    xhr.send();
  });
};

const getUserData = function () {
  return serverRequest("/api/userdata", "");
};

const getGamesList = function () {
  return serverRequest("/api/gameslist", "");
};

const getGameScores = function (gameName) {
  return serverRequest("/api/gamescores", `gamename=${gameName}`);
};

const getMyScores = function () {
  return serverRequest("/api/userscores", "");
};
