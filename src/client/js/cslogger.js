class CSLogger {
  constructor(name) {
    this._name = name;
  }
  getTimeStamp() {
    let date = new Date();

    let dateTime =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0") +
      " " +
      date.getHours().toString().padStart(2, "0") +
      ":" +
      date.getMinutes().toString().padStart(2, "0") +
      ":" +
      date.getSeconds().toString().padStart(2, "0");

    return dateTime;
  }
  info(message) {
    console.log(
      `[ INFO ] - [ ${this._name} ] - [${this.getTimeStamp()}] : ${message}`
    );
  }
}
