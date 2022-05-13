if (document.getElementById("play-guest-button") != null) {
    document.getElementById("play-guest-button").onclick = () => {
        window.location.href = "/games";
    }
}
if (document.getElementById("login-button") != null) {
  document.getElementById("login-button").onclick = () => {
    window.location.href = "#";
  };
}