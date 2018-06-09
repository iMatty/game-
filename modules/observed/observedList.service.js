angular.module("observed").factory("observedList",
		["$rootScope", "auth", "$timeout", function($rootScope, auth, $timeout) {
	let firebaseRef;

	let observedList = {
		list: null,
		add: function(platform, id) {
			firebaseRef && firebaseRef.child(this.key(platform, id))
										.set({platform: platform, id: id});
		},
		remove: function(key) {
			firebaseRef && firebaseRef.child(key).remove();
		},
		key: function(platform, id) {
			return platform + "-" + id;
		},
		isObserved: function(key) {
			return this.list && (this.list[key] !== undefined);
		}
	};

	$rootScope.$watch(() => auth.user, function(user) {
		if(user) {
			initializeSyncList(user);
		} else {
			destroySyncList();
		}
	});

	function initializeSyncList(user) {
		firebaseRef = firebase.database().ref("users/" + user.uid + "/observedGames");
		firebaseRef.once("value").then(function(snapshot) {
			// initialize
			$timeout(() => { $rootScope.$apply(() => {
				observedList.list = snapshot.val() || {};
			}); }, 0, false);

			syncList();
		});
	}
	
	function syncList() {
		firebaseRef.on("child_added", function(child) {
			let val = child.val();
			let key = observedList.key(val.platform, val.id);
			$timeout(() => { $rootScope.$apply(() => {
				observedList.list[key] = val;
			}); }, 0, false);
		});

		firebaseRef.on("child_removed", function(child) {
            let val = child.val();
            let key = observedList.key(val.platform, val.id);
			$timeout(() => { $rootScope.$apply(() => {
				observedList.list[key] = undefined;
			}); }, 0, false);
		});
	}

	function destroySyncList() {
        observedList.list = null;
        if(firebaseRef){
            firebaseRef.off();
            firebaseRef = null
        }
	}

	return observedList;
}]);