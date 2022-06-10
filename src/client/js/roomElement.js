class RoomElement {
  constructor(data) {
    this._roomId = data.roomId;
    this._players = data.userIds;
    let template = document.getElementById("list-element-template");
    this._htmlElement = template.content.firstElementChild.cloneNode(true);
    this._htmlElement.innerHTML = `${data.roomId}, players: ${data.userIds}`;
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
