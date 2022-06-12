async function displayGameTabs() {
  let template = document.getElementById("game-template");
  let list = document.getElementById("games");

  getGamesList().then((data) => {
    let games = data.data;
    for (const element of games) {
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      htmlElement.classList.add(element);
      htmlElement.querySelector(".nav-link").innerHTML = element;
      htmlElement.querySelector(".nav-link").href =
        "/hallOfFame?game=" + element;
      list.appendChild(htmlElement);
    }
  });
}
function setActiveTab(game) {
  let tabs = document.getElementById("games").childNodes;
  for (let i = 0; i < tabs.length; i++) {
    let navlink = tabs[i].querySelector(".nav-link");
    if (tabs[i].classList.contains(game)) {
      navlink.classList.add("nav-link-active");
    } else navlink.classList.remove("nav-link-active");
  }
}
function displayScores(game) {
  let template = document.getElementById("score-template");
  let list = document.getElementById("player-scores");
  if (game == null) {
    return;
  }
  setActiveTab(game);
  getGameScores(game).then((data) => {
    let scores = Object.entries(data.data).sort(([, a], [, b]) => b - a);
    let i = 1;
    for (const [name, score] of scores) {
      let htmlElement = template.content.firstElementChild.cloneNode(true);
      htmlElement.classList.add("ranking-position-" + i);
      htmlElement.querySelector(".ranking-position").innerHTML = i++;
      htmlElement.querySelector(".name").innerHTML = name;
      htmlElement.querySelector(".name").title = name;
      htmlElement.querySelector(".score").innerHTML = score;
      list.appendChild(htmlElement);
    }
  });
}

displayGameTabs().then(() => {
  let url_string = window.location.href;
  let url = new URL(url_string);
  let game = url.searchParams.get("game");

  displayScores(game);
});
