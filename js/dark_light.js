$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    trigger: "hover"
  });
  $("#darkLightToggle").click(function () {
    if ($("body").hasClass("light-mode")) {
      $("body").removeClass("light-mode").addClass("dark-mode");
      $("#gamesTable").toggleClass("table-dark");
      $(this).attr('data-original-title', "Toggle light mode").tooltip('show');
    } else {
      $("body").removeClass("dark-mode").addClass("light-mode");
      $("#gamesTable").toggleClass("table-dark");
      $(this).attr('data-original-title', "Toggle dark mode").tooltip('show');
    }
  });
});