angular.module("firebaseuiAuth", [])
	.value("auth", {
		loginReady: false,
		user: null,
		signOut: function() {
			firebase.auth().signOut();
		}
	})
	.component("firebaseuiAuth", {
		template: "<div id='firebaseui-auth-container'></div>",
		controller: ["$scope", "auth", function($scope, auth) {
			var uiConfig = getConfig();
			var ui = new firebaseui.auth.AuthUI(firebase.auth());
			firebase.auth().onAuthStateChanged(user => $scope.$apply(updateAuth(user)));
			
			function getConfig() {
				// firebaseui config
				return {
					callbacks: {
						signInSuccessWithAuthResult: function(authResult, redirectUrl) {
							$('#signInModal').modal('hide');
							return false;
						}
					},
					credentialHelper: firebaseui.auth.CredentialHelper.NONE,
					signInFlow: 'popup',
					signInOptions: [
						firebase.auth.EmailAuthProvider.PROVIDER_ID,
						firebase.auth.GoogleAuthProvider.PROVIDER_ID,
						{
							provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
							scopes: [
								'public_profile',
								'email' ]
						},
						firebase.auth.GithubAuthProvider.PROVIDER_ID,
					],
					tosUrl: 'http://rainbow.nazwa.pl/terms-of-service'
				};
			}
			
			function updateAuth(user) {
				if (user) {
					// User is signed in.
					auth.user = user;
				} else {
					// User is signed out.
					auth.user = null;
					if(!ui.isPendingRedirect()) {
						ui.start('#firebaseui-auth-container', uiConfig);
					}
				}
				auth.loginReady = true;
			}
		}]
	});
	