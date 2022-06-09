const getName = function (actionIfSuccessful, actionIfFailed) {
  let xhr = new XMLHttpRequest();
  let url = "/api/username";
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
        actionIfFailed();
        return;
      }
      if (this.status == 200 && JSONanswer.successful) {
        actionIfSuccessful(JSONanswer.name);
      } else {
        actionIfFailed();
      }
    }
  };
  xhr.send();
};
