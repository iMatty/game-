$(document).ready(function () {
  $("#darkLightToggle").click(function () {
    if($("body").hasClass("light-mode")) {
      $("body").removeClass("light-mode").addClass("dark-mode");
      $("#gamesTable").toggleClass("table-dark");
	  $("#darkLightToggle").text("light mode");
    } else {
      $("body").removeClass("dark-mode").addClass("light-mode");
      $("#gamesTable").toggleClass("table-dark");
	  $("#darkLightToggle").text("dark mode");
    }
  });
});