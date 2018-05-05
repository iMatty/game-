$(document).ready(function(){
	
		$("#contact_info").hide();
		$("#contact").click(function(){
			$("#page").hide();
			$("#contact_info").show();
			$("#contact_info").css('color', 'white');
		});
		
		$("#lightsButton").click(function() {
			var now = $("#lightsButton").html();
				if (now == "Light") {
					$("#lightsButton").html("Dark");
					$("body").css("background-color", "white");
					$("#logo_2").css("color", "black");
					$("#contact_info").css("color", "black");
				}
				else if (now == "Dark") {
					$("#lightsButton").html("Light");
					$("body").css("background-color", "#404040");
					$("#logo_2").css("color", "white");
					$("#contact_info").css("color", "white");
				}
		});
});