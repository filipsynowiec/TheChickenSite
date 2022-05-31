class GameElement {
  constructor(name, title, url) {
    this._name = name;
    this._title = title;
    this._url = url;
    let template = document.getElementById("list-element-template");
    this._htmlElement = template.content.firstElementChild.cloneNode(true);
    let listElementText = this._htmlElement.querySelector(".list-element-text");
    listElementText.innerHTML = title;
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
