$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    trigger: 'hover'
  });
  $("#darkLightToggle").click(function () {
    if ($("body").hasClass("light-mode")) {
      $("body").removeClass("light-mode").addClass("dark-mode");
      $("#gamesTable").toggleClass("table-dark");
    } else {
      $("body").removeClass("dark-mode").addClass("light-mode");
      $("#gamesTable").toggleClass("table-dark");
    }
  });
});