$(document).ready(function () {
  $('#darkLightToggle').tooltip({
    trigger: "hover"
  });
  $("#darkLightToggle").click(function () {
    if ($("body").hasClass("light-mode")) {
      $("body").removeClass("light-mode").addClass("dark-mode");
      $("#gamesTable").toggleClass("table-dark");
      $(this).attr('data-original-title', "Toggle light mode");
    } else {
      $("body").removeClass("dark-mode").addClass("light-mode");
      $("#gamesTable").toggleClass("table-dark");
      $(this).attr('data-original-title', "Toggle dark mode");
    }
  });
});