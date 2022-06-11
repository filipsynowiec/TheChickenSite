const getUserData = function () {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    let url = "/api/userdata";
    let token = localStorage.getItem("token");
    xhr.open("GET", url, true);
    xhr.setRequestHeader("x-access-token", "Bearer " + token);
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        console.log(xhr.responseText);
        let JSONanswer;
        try {
          JSONanswer = JSON.parse(xhr.responseText);
        } catch (error) {
          reject(error);
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
