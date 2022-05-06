const EMPTY = 0
const CROSS = 1
const CIRCLE = 2
const FULL = 3

class TickTackToeClient {
    constructor(socket) {
        this._socket = socket;
        let instance = this;
        this._socket.on("updateStatus", (data) =>
            instance.updateStatus(data)
        );
        this._socket.on("gameHTML", (data) => {
            instance.updateHTML("game_area", data.gameHTML);
            instance.sendClientReady(instance);
            instance.startGame(instance);
        });
        this._buttons = [];
    }
    updateHTML(element, data) {
        document.getElementById(element).innerHTML = data;
    }
    clickField(instance, index) {
        instance._socket.emit("requestAction", { field: index });
    }
    updateStatus(data) {
        if(data.turn == CROSS) {
            document.getElementById("turn").innerHTML = "Turn: X";
        } else {
            document.getElementById("turn").innerHTML = "Turn: O";
        }
            
        for(let i=0; i<9; ++i) {
            switch(data.fields[i]) {
                case EMPTY: 
                    this._buttons[i].innerHTML = "";
                    break;
                case CROSS: 
                    this._buttons[i].innerHTML = "X";
                    break;
                case CIRCLE:
                    this._buttons[i].innerHTML = "O";
                    break;
            }
            if(data.fields[i] != EMPTY) {
                this._buttons[i].disabled = true;
            }
        }
        if(data.won != EMPTY) {
            let winner = "";
            switch(data.won) {
                case CROSS: 
                winner = "X";
                    break;
                case CIRCLE:
                    winner = "O";
                    break;
                case FULL: 
                    winner = "NONE";
                    break;
            }
            document.getElementById("winner").innerHTML = "Winner: " + winner;
            for(let i=0; i<9; ++i) {
                this._buttons[i].disabled = true;
            }
        }
    }
    startGame(instance) {
        for(let i=0; i<9; ++i) {
            this._buttons[i] = document.createElement("button");

            this._buttons[i].style.width = '100px';
            this._buttons[i].style.height = '100px';
            this._buttons[i].style.background = 'teal'; 
            this._buttons[i].style.color = 'white';
            this._buttons[i].style.fontSize = '50px';
            this._buttons[i].style.margin = '5px';
            this._buttons[i].style.verticalAlign = 'top';

            this._buttons[i].onclick = () => {
                instance.clickField(instance, i);
            };
        }
        for(let i=0; i<3; ++i) {
            let div = document.createElement("div");
            document.getElementById("tick_tack_buttons").appendChild(div);
            for(let j=0; j<3; ++j) {
                div.appendChild(this._buttons[i*3+j]);
            }
        }
    }
    sendClientReady(instance) {
        instance._socket.emit("clientReady", {});
        console.log(`Sending client ready`);
    }
}

let client = new TickTackToeClient(io());