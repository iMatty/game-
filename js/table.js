angular.module("table", ["angular.filter", "datatables"])
    .run(function ($rootScope) {
        $rootScope.dtOptions = {
            searching: false,
            destroy: true,
            language: {
                emptyTable: "No results found",
                info: "Total results found: _MAX_",
                infoEmpty: ""
            }
        };
    })
    .controller("tableCtrl", function ($scope, $http, $timeout, $filter) {

        var initialized = false;
        var data = [];
        var steamApi = [];

        $http.get("../data/steam-min.json")
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
                data = [];
                $scope.data = data;
                if ($scope.search.length >= 3) {
                    getGalaxySearchList();
                    getSteamSearchList();
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
            $http.get("http://rainbow.nazwa.pl:9000/https://embed.gog.com/games/ajax/filtered?mediaType=game&search=" + $scope.search)
                .then(function (response) {
                    for (let i = 0; i < response.data.products.length; i++) {
                        galaxySearchList.push(response.data.products[i]);
                    }
                    getGalaxyGameList(galaxySearchList);
                })
                .catch(function (response) { })
        };

        function getSteamSearchList() {
            let steamSearchList = [];
            let mapList = [];
            steamSearchList = $filter("filter")(steamApi, { search: $scope.search });
            mapList = steamSearchList.map(id => id.app);
            getSteamGameList(steamSearchList, mapList);
        };

        function getGalaxyGameList(galaxySearchList) {
            if (galaxySearchList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids=" + galaxySearchList.map(id => id.id).join(","))
                    .then(function (response) {
                        for (let i = 0; i < response.data.length; i++) {
                            data.push({
                                name: galaxySearchList[i].title,
                                app: galaxySearchList[i].id,
                                type: response.data[i].game_type,
                                price: galaxySearchList[i].price.amount,
                                sale: galaxySearchList[i].price.isDiscounted,
                                platform: "GOG",
                                link: "https://www.gog.com" + galaxySearchList[i].url
                            });
                        }
                        $scope.galaxyReady = true;
                    })
                    .catch(function (response) { $scope.galaxyReady = true; })
            } else {
                $scope.galaxyReady = true;
            }
        };

        function getSteamGameList(steamSearchList, mapList) {
            if (mapList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/appdetails?appids=" + mapList.join(",") + "&filters=price_overview")
                    .then(function (response) {
                        for (let i = 0; i < mapList.length; i++) {
                            if (response.data[mapList[i]].success) {
                                data.push({
                                    name: steamSearchList[i].name,
                                    app: steamSearchList[i].app,
                                    type: steamSearchList[i].type,
                                    price: response.data[mapList[i]].data.price_overview != undefined ? (response.data[mapList[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                    sale: response.data[mapList[i]].data.price_overview != undefined ? (response.data[mapList[i]].data.price_overview.discount_percent != 0 ? true : false) : false,
                                    platform: "Steam",
                                    link: "https://store.steampowered.com/app/" + steamSearchList[i].app
                                });
                            }
                        }
                        $scope.steamReady = true;
                    })
                    .catch(function (response) { $scope.steamReady = true; })
            } else {
                $scope.steamReady = true;
            }
        };
    })