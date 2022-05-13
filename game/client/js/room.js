class Room {
    constructor(roomId, players) {
        this._roomId = roomId;
        this._players = players;
        this._htmlElement = document.createElement("div");
        this._htmlElement.innerHTML = roomId;
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
    select() {
        this._htmlElement.style.color = "green";
    }
    deselect() {
        this._htmlElement.style.color = "black";
    }
}
