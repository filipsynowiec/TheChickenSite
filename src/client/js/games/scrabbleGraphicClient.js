const BOARD_SIZE = 15;

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
    if(show) {
        controlPane.style.display = "block";
    } else {
        controlPane.style.display = "none";
    }   
  }
  setSelectedHand(x, selected) {
      if(selected) {
        this._handButtons[x].style.background = "orange";
      } else {
        this._handButtons[x].style.background = "white";
      }
  }
  setDisabledHand(x, disabled) {
    this._handButtons[x].disabled = disabled
  }
  clearHandPane() {
    document.getElementById("hand-pane").innerHTML = "";
  }
  addHandButton(x, text, lambda) {
    this._handButtons[x] = document.createElement("button");
    this._handButtons[x].innerText = text;
    this._handButtons[x].onclick = lambda;
    this._handButtons[x].style.width = "50px";
    this._handButtons[x].style.height = "50px";
    this._handButtons[x].style.fontSize = "17px";
    this._handButtons[x].style.margin = "5px";
    this._handButtons[x].style.background = "white";
    document.getElementById("hand-pane").appendChild(this._handButtons[x]);
  }
  createBoardButtons(lambda) {
    for (let i = 0; i < BOARD_SIZE; ++i) {
      this._boardButtons[i] = [];
      let div = document.createElement("div");
      for (let j = 0; j < BOARD_SIZE; ++j) {
        this._boardButtons[i][j] = document.createElement("button");

        this._boardButtons[i][j].style.width = "35px";
        this._boardButtons[i][j].style.height = "35px";
        this._boardButtons[i][j].style.fontSize = "18px";
        this._boardButtons[i][j].style.margin = "2px";
        this._boardButtons[i][j].style.verticalAlign = "top";
        this._boardButtons[i][j].disabled = true;

        this._boardButtons[i][j].onclick = () => lambda(i, j);

        div.appendChild(this._boardButtons[i][j]);
      }
      document.getElementById("board-pane").appendChild(div);
    }
  }
  createControlButtons(resetLambda, applyLambda, rerollLambda) {
    let div = document.getElementById("control-buttons-pane");

    let resetButton = document.createElement("button");
    resetButton.style.fontSize = "17px";
    resetButton.style.height = "50px";
    resetButton.style.marginLeft = "15px";
    resetButton.style.marginTop = "15px";
    resetButton.style.width = "150px";
    resetButton.innerText = "Reset";
    resetButton.onclick = resetLambda;
    div.appendChild(resetButton);

    let applyButton = document.createElement("button");
    applyButton.style.fontSize = "17px";
    applyButton.style.height = "50px";
    applyButton.style.marginLeft = "15px";
    applyButton.style.marginTop = "15px";
    applyButton.style.width = "150px";
    applyButton.innerText = "Apply";
    applyButton.onclick = applyLambda;
    div.appendChild(applyButton);

    let rerollButton = document.createElement("button");
    rerollButton.style.fontSize = "17px";
    rerollButton.style.height = "50px";
    rerollButton.style.marginLeft = "15px";
    rerollButton.style.marginTop = "15px";
    rerollButton.style.width = "150px";
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
