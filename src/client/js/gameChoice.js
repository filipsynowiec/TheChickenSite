let cslogger = new CSLogger("GameChoiceClient");

class GameChoiceClient {
  constructor(socket) {
    this._socket = socket;
    this._selectedGame = null;
    this._games = [];

    let instance = this;
    this._socket.on("getGamesList", (data) => {
      instance.addGamesList(data);
    });

    if (document.getElementById("enter-game-button") != null) {
      document.getElementById("enter-game-button").onclick = () =>
        instance.playGame();
    }
  }
  playGame() {
    let game = this._selectedGame;
    if (game == null) {
      return;
    }
    cslogger.info(`Game ${game.name} selected to play.`);
    window.location.href = game.url;
  }

  addGamesList(data) {
    cslogger.info(`addGamesList invoked with ${data}`);

    let list = document.getElementById("games-list");
    if (list == null) return;

    let instance = this;
    for (const [key, value] of Object.entries(data.gamesList)) {
      let name = value.name;
      var is_set = this._games.find((game) => {
        return game.name == name;
      });
      if (is_set != undefined) {
        cslogger.info(`game dupplication: ${name}`)
        continue;
      }
      let title = value.title;
      let room_url = value.room_url;
      let game = new GameElement(name, title, room_url);
      cslogger.info(`new game added ${game.name}, ${game.title}, ${game.url}`);

      game.setOnClick(() => instance.selectGame(game));
      list.appendChild(game.htmlElement);
      this._games.push(game);
    }
  }
  selectGame(game) {
    cslogger.info(`selectGame invoked with ${game.name}`);
    this._selectedGame = game;
    for (let g of this._games) {
      g.deselect();
    }
    game.select();
  }
}
const socket = io({
  extraHeaders: {
    source: "GAME_CHOICE",
    "x-access-token": "Bearer " + localStorage.getItem("token"),
  },
});
let gameChoiceClient = new GameChoiceClient(socket);
