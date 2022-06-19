let csloggerLogOut = new CSLogger("LogOutClient");

function logOut() {
  csloggerLogOut.info("Forgetting token.");
  localStorage.setItem("token", "");
}
