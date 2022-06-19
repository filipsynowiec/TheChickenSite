let csloggerElement = new CSLogger("RoomElement");

class RoomElement {
  constructor(data) {
    this._roomId = data.roomId;
    this._players = data.userIds;
    let template = document.getElementById("list-element-template");
    let playerTemplate = document.getElementById("list-player-template");
    this._htmlElement = template.content.firstElementChild.cloneNode(true);
    this._htmlElement.querySelector(".roomId").innerHTML = `${data.roomId}`;
    csloggerElement.info(data.results);
    for (const [key, value] of Object.entries(data.results)) {
      let playerElement =
        playerTemplate.content.firstElementChild.cloneNode(true);
      playerElement.querySelector(".player-name").innerHTML = key;
      playerElement.querySelector(".player-name").title = key;
      playerElement.querySelector(".player-elo").innerHTML = value;
      this._htmlElement.querySelector(".players").appendChild(playerElement);
    }
    // this._htmlElement.innerHTML = `${data.roomId}, players: ${JSON.stringify(
    //   data.results
    // )}`;
  }
  get roomId() {
    return this._roomId;
  }
  get players() {
    return this._players;
  }
  get htmlElement() {
    return this._htmlElement;
  }
  setOnClick(action) {
    this._htmlElement.onclick = action;
  }
  select() {
    this._htmlElement.classList.add("active");
  }
  deselect() {
    this._htmlElement.classList.remove("active");
  }
}
