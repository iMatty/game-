$(document).ready(function(){
		$("#contact_info").hide();
		$("#contact").click(function(){
			$("#page").hide();
			$("#contact_info").show();
			$("#contact_info").css('color', 'white');
		});
});