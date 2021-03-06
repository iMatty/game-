angular.module("observed").factory("observedList",
		["$rootScope", "auth", "$timeout", "gameDetailsFetcher",
			function($rootScope, auth, $timeout, gameDetailsFetcher) {
	let firebaseRef;
	let gameDetFetch;

	let observedList = {
		list: null,
		add: function(key, app) {
			firebaseRef && firebaseRef.child(key).set({
                                                platform: app.platform,
                                                app: app.app,
                                                type: app.type,
                                                name: app.name,
                                                link: app.link,
                                                image: app.image});
		},
		remove: function(key) {
			firebaseRef && firebaseRef.child(key).remove();
		},
		key: function(platform, app) {
			return platform + "-" + app;
		},
		isObserved: function(key) {
			return this.list && this.list.data && (this.list.data[key] !== undefined);
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
                observedList.list = new gameDetailsFetcher(snapshot.val() || {});
                syncList();
			}); }, 0, false);
		});
	}
	
	function syncList() {
		firebaseRef.on("child_added", function(child) {
			let val = child.val();
			let key = observedList.key(val.platform, val.app);
			$timeout(() => { $rootScope.$apply(() => {
				observedList.list[key] = val;
			}); }, 0, false);
            observedList.list.fetchById(val);
		});

		firebaseRef.on("child_removed", function(child) {
            let val = child.val();
            let key = observedList.key(val.platform, val.app);
			$timeout(() => { $rootScope.$apply(() => {
				delete observedList.list.data[key];
                observedList.list.length--;
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