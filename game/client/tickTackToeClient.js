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
        for(var i=0; i<9; ++i) {
            this._buttons[i].innerHTML = data.fields[i];
        }
    }
    startGame(instance) {
        for(var i=0; i<9; ++i) {
            this._buttons[i] = document.createElement("button");
            this._buttons[i].innerHTML = "XD";
            this._buttons[i].onclick = () => {
                instance.clickField(instance, i);
            };
            document.body.appendChild(btn);
        }
    }
    sendClientReady(instance) {
        instance._socket.emit("clientReady", {});
        console.log(`Sending client ready`);
    }
}

let client = new TickTackToeClient(io());