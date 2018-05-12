var userProfile = document.getElementById("account");
		
function onSuccess(googleUser) {				
	userProfile.innerHTML = '<a class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">'
						+ googleUser.getBasicProfile().getName() + '</a>'
						+ '<div class="dropdown-menu dropdown-menu-right">'
						+ '	<a class="dropdown-item">My account</a>'
						+ '	<a class="dropdown-item" onclick="onFailure();">Logout</a>'
						+ '</div>';
}
function onFailure() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		 renderButton();
	});
}
function renderButton() {
	userProfile.innerHTML = '<a id="signInButton"></a>';
	gapi.signin2.render('signInButton', {
		'scope': 'profile email',
		'width': 120,
		'height': 25,
		'longtitle': false,
		'theme': 'light',
		'onsuccess': onSuccess,
		'onfailure': onFailure
	});
}