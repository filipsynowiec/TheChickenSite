class RoomElement {
  constructor(roomId, players) {
    this._roomId = roomId;
    this._players = players;
    let template = document.getElementById("list-element-template");
    this._htmlElement = template.content.firstElementChild.cloneNode(true);
    let listElementText = this._htmlElement.querySelector(".list-element-text");
    listElementText.innerHTML = roomId;
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
    this._htmlElement.classList.add("list-element-selected");
  }
  deselect() {
    this._htmlElement.classList.remove("list-element-selected");
  }
}
