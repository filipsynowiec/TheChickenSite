class Game {
  constructor(name, title, url) {
    this._name = name;
    this._title = title;
    this._url = url
    this._htmlElement = document.createElement("div");
    this._htmlElement.innerHTML = title;
  }
  get name() {
    return this._name;
  }
  get title() {
    return this._title;
  }
  get url() {
    return this._url;
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
