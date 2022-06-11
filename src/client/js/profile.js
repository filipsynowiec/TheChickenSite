function displayScores() {
  let template = document.getElementById("score-template");
  let playerScores = document.getElementById("player-scores");

  
  getMyScores().then((data) => {
    let scores = data.data;
    for (const element of scores) {
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      htmlElement.querySelector(".game").innerHTML = element.name;
      htmlElement.querySelector(".score").innerHTML = element.score;
      playerScores.appendChild(htmlElement);
    }
  });
}

function displayName() {
  let header = document.getElementById("profile-header");
  getUserData().then((data) => {
    let name = data.name;
    header.innerHTML = name;
  })
}

displayScores();
displayName();