const getName = function (action) {
  let xhr = new XMLHttpRequest();
  let url = "/api/username";
  let token = localStorage.getItem("token");
  xhr.open("GET", url, true);
  xhr.setRequestHeader("x-access-token", "Bearer " + token);
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE) {
      action(xhr.responseText);
    }
  };
  xhr.send();
};
