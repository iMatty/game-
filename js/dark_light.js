function toggleDarkLight() {
  var body = document.getElementById("body");
  var toggleButton = document.getElementById("darkLightToggle");
  body.className = body.className == "dark-mode" ? "light-mode" : "dark-mode";
  toggleButton.innerHTML = body.className == "dark-mode" ? "dark" : "light";
}