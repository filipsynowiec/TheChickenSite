const BOARD_SIZE = 15;
const BOARD_BUTTON_SIZE = "min(3vh, 3.5vw)";
const BOARD_FONT_SIZE = "min(1.2vh, 1.2vw)";

class ScrabbleGraphicClient {
  constructor() {
    this._boardButtons = [];
    this._handButtons = [];
  }
  makeStarting(x, y) {
    this._boardButtons[x][y].style.background = "red";
  }
  placeTile(x, y, letter) {
    this._boardButtons[x][y].innerText = letter;
    this._boardButtons[x][y].style.background = "yellow";
  }
  makeEmpty(x, y) {
    this._boardButtons[x][y].innerText = "";
    this._boardButtons[x][y].style.background = "white";
  }
  makeSelected(x, y, letter) {
    this._boardButtons[x][y].innerText = letter;
    this._boardButtons[x][y].style.background = "green";
  }
  setDisabledBoard(x, y, disabled) {
    this._boardButtons[x][y].disabled = disabled;
  }
  setShowControlButtons(show) {
    let controlPane = document.getElementById("control-buttons-pane");
    if (show) {
      controlPane.style.display = "block";
    } else {
      controlPane.style.display = "none";
    }
  }
  setSelectedHand(x, selected) {
    if (selected) {
      this._handButtons[x].style.background = "orange";
    } else {
      this._handButtons[x].style.background = "white";
    }
  }
  setDisabledHand(x, disabled) {
    this._handButtons[x].disabled = disabled;
  }
  clearHandPane() {
    document.getElementById("hand-pane").innerHTML = "";
  }
  createSingleHandButton() {
    let button = document.createElement("button");
    button.classList.add("col-1");
    button.classList.add("md-col-1-small");
    button.style.margin = "1px";
    button.style.padding = "0";
    return button;
  }
  addHandButton(x, text, lambda) {
    this._handButtons[x] = this.createSingleHandButton();
    this._handButtons[x].innerText = text;
    this._handButtons[x].onclick = lambda;

    document.getElementById("hand-pane").appendChild(this._handButtons[x]);
  }
  createBoardRow() {
    let row = document.createElement("div");
    row.style.height = BOARD_BUTTON_SIZE;
    return row;
  }
  createSingleBoardButton() {
    let button = document.createElement("button");
    button.style.height = BOARD_BUTTON_SIZE;
    button.style.width = BOARD_BUTTON_SIZE;
    button.disabled = true;
    button.style.fontSize = BOARD_FONT_SIZE;
    button.style.lineHeight = BOARD_FONT_SIZE;
    button.style.verticalAlign = "middle";
    button.style.color = "black";
    return button;
  }
  createBoardButtons(lambda) {
    for (let i = 0; i < BOARD_SIZE; ++i) {
      this._boardButtons[i] = [];
      let row = this.createBoardRow();
      for (let j = 0; j < BOARD_SIZE; ++j) {
        this._boardButtons[i][j] = this.createSingleBoardButton();
        this._boardButtons[i][j].onclick = () => lambda(i, j);

        row.appendChild(this._boardButtons[i][j]);
      }
      document.getElementById("board-pane").appendChild(row);
    }
  }
  createSingleControlButton() {
    let button = document.createElement("button");
    button.classList.add("col-3");
    button.classList.add("md-col-3");
    button.style.margin = "2px";
    return button;
  }
  createControlButtons(resetLambda, applyLambda, rerollLambda) {
    let div = document.getElementById("control-buttons-pane");

    let resetButton = this.createSingleControlButton();
    resetButton.innerText = "Reset";
    resetButton.onclick = resetLambda;
    div.appendChild(resetButton);

    let applyButton = this.createSingleControlButton();
    applyButton.innerText = "Apply";
    applyButton.onclick = applyLambda;
    div.appendChild(applyButton);

    let rerollButton = this.createSingleControlButton();
    rerollButton.innerText = "Reroll All";
    rerollButton.onclick = rerollLambda;
    div.appendChild(rerollButton);
  }
  writeScore(msg) {
    document.getElementById("scores").innerText = msg;
  }
  showError(msg) {
    Swal.fire("Wrong move", msg, "error");
  }
  showInfo(msg) {
    Swal.fire(msg);
  }
}
