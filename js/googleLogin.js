var userProfile = document.getElementById("account");
		
function onSuccess(googleUser) {
	userProfile.innerHTML = '<a id="userProfile" class="nav-link" onclick="onFailure();">' + 
						googleUser.getBasicProfile().getName() + ' &#9660;</a>';
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