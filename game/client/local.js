if (document.getElementById("play-guest-button") != null) {
    document.getElementById("play-guest-button").onclick = () => {
        window.location.href = "/rooms";
    }
}
if (document.getElementById("login-button") != null) {
  document.getElementById("login-button").onclick = () => {
    window.location.href = "#";
  };
}