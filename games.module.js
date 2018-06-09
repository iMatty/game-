angular.module("games", ["ngRoute", "loadingIcon", "firebaseuiAuth", "observed", "datatables"])
	.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix("");
        $routeProvider
            .when("/", {
                templateUrl: "" //"<x-search></x-search>"
            })
			.when("/profile", {
                templateUrl: "" //"<x-profile></x-profile>"
            })
            .otherwise({
                redirectTo: "/"
            });
    }])
	.run(["$rootScope", "auth", "observedList", function($rootScope, auth, observedList) {
		$rootScope.user = {
			auth: auth,
			observedList: observedList
		};
		
		$rootScope.dtOptions = {
            searching: false,
            destroy: true,
            language: {
                emptyTable: "No results found",
                info: "Total results found: _MAX_",
                infoEmpty: ""
            }
        };
	}])
	.controller("tableCtrl", function ($scope, $http, $q, $timeout, $filter) {

        var initialized = false;
        var data = [];
        var steamApi = [];
        var canceler = $q.defer();


        $http.get("../data/steam.min.json")
            .then(function (response) {
                for (let i = 0; i < response.data.applist.apps.length; i++) {
                    steamApi.push({
                        app: response.data.applist.apps[i].app,
                        name: response.data.applist.apps[i].name,
                        type: response.data.applist.apps[i].type,
                        search: (response.data.applist.apps[i].name).replace(/[^\w\s-]/gi, '')
                    });
                }
            })
            .catch(function (response) { });

        $scope.$watch("search", function () {
            if (initialized) {
                $scope.galaxyReady = false;
                $scope.steamReady = false;
                canceler.resolve();
                canceler = $q.defer();
                data = [];
                $scope.data = data;
                if ($scope.search.length >= 3) {
                    getGalaxySearchList();
                    getSteamStoreList()
                } else {
                    $scope.galaxyReady = true;
                    $scope.steamReady = true;
                }
            } else {
                $timeout(function () {
                    initialized = true;
                });
            }
        });

        function getGalaxySearchList() {
            let galaxySearchList = [];
            $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://embed.gog.com/games/ajax/filtered?mediaType=game&search=" + $scope.search, timeout: canceler.promise })
                .then(function (response) {
                    for (let i = 0; i < response.data.products.length; i++) {
                        galaxySearchList.push(response.data.products[i]);
                    }
                    getGalaxyGameList(galaxySearchList);
                })
                .catch(function (response) { })
        };

        function getGalaxyGameList(galaxySearchList) {
            if (galaxySearchList.length != 0) {
                $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids=" + galaxySearchList.map(id => id.id).join(","), timeout: canceler.promise })
                    .then(function (response) {
                        for (let i = 0; i < response.data.length; i++) {
                            data.push({
                                name: galaxySearchList[i].title,
                                app: galaxySearchList[i].id,
                                type: response.data[i].game_type,
                                price: galaxySearchList[i].price.amount,
                                sale: galaxySearchList[i].price.discountPercentage,
                                platform: "GOG",
                                link: "https://www.gog.com" + galaxySearchList[i].url,
                                image: galaxySearchList[i].image + "_product_quartet_250.jpg"
                            });
                        }
                        $scope.galaxyReady = true;
                    })
                    .catch(function (response) { })
            } else {
                $scope.galaxyReady = true;
            }
        };

        function getSteamStoreList() {
            let steamStoreList = [];
            $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/storesearch/?term=" + $scope.search, timeout: canceler.promise })
                .then(function (response) {
                    for (let i = 0; i < response.data.items.length; i++) {
                        let find = steamApi.find(id => (id.app == response.data.items[i].id));
                        if (find != null) {
                            steamStoreList.push(find);
                        }
                    }
                    getSteamSearchList(steamStoreList);
                })
                .catch(function (response) { })
        }

        function getSteamSearchList(steamStoreList) {
            let steamSearchList = [];
            let mapList = [];
            steamSearchList = $filter("filter")(steamApi, { search: $scope.search });
            steamSearchList = steamStoreList.concat(steamSearchList);
            steamSearchList = $filter("unique")(steamSearchList);
            steamSearchList = $filter("limitTo")(steamSearchList, 50);
            mapList = steamSearchList.map(id => id.app);
            getSteamGameList(steamSearchList, mapList);
        };

        function getSteamGameList(steamSearchList, mapList) {
            if (mapList.length != 0) {
                $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/appdetails?appids=" + mapList.join(",") + "&filters=price_overview", timeout: canceler.promise })
                    .then(function (response) {
                        for (let i = 0; i < mapList.length; i++) {
                            if (response.data[mapList[i]].success) {
                                data.push({
                                    name: steamSearchList[i].name,
                                    app: steamSearchList[i].app,
                                    type: steamSearchList[i].type,
                                    price: response.data[mapList[i]].data.price_overview != undefined ? (response.data[mapList[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                    sale: response.data[mapList[i]].data.price_overview != undefined ? response.data[mapList[i]].data.price_overview.discount_percent : 0,
                                    platform: "Steam",
                                    link: "https://store.steampowered.com/app/" + steamSearchList[i].app,
                                    image: "https://steamcdn-a.akamaihd.net/steam/apps/" + steamSearchList[i].app + "/header.jpg"
                                });
                            }
                        }
                        $scope.steamReady = true;
                    })
                    .catch(function (response) { })
            } else {
                $scope.steamReady = true;
            }
        };
    })
	.filter('unique', function () {

		return function (items, filterOn) {

			if (filterOn === false) {
				return items;
			}

			if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
				var hashCheck = {}, newItems = [];

				var extractValueToCompare = function (item) {
					if (angular.isObject(item) && angular.isString(filterOn)) {
						return item[filterOn];
					} else {
						return item;
					}
				};

				angular.forEach(items, function (item) {
					var valueToCheck, isDuplicate = false;

					for (var i = 0; i < newItems.length; i++) {
						if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
							isDuplicate = true;
							break;
						}
					}
					if (!isDuplicate) {
						newItems.push(item);
					}

				});
				items = newItems;
			}
			return items;
		};
	});