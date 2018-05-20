angular.module("gamesApi", ["angular.filter", "datatables", "ngRoute"])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix("");
        $routeProvider
            .when("/", {
                templateUrl: "../table.html"
            })
            .otherwise({
                redirectTo: "/"
            });
    })
    .run(function ($rootScope) {
        $rootScope.steamReady = true;
        $rootScope.galaxyReady = true;
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
    .factory("searchService", function () {
        var phrase = { searchPhrase: "" };

        return {
            getPhrase: function () {
                return phrase.searchPhrase;
            },
            setPhrase: function (search) {
                phrase.searchPhrase = search;
            }
        };
    })
    .factory("gameListService", function () {
        var list = {
            gameList: [],
            steamReady: false,
            galaxyReady: false
        };

        return {
            getList: function () {
                return list.gameList;
            },
            setList: function (games) {
                list.gameList.push(games);
            },
            clearList: function () {
                list.gameList = [];
            }
        };
    })
    .controller("steamApiCtrl", function ($scope, $rootScope, $http, $filter, searchService, gameListService) {
        var appList = [];
        var filterList = [];
        var mapList = [];
        var init = false;

        $scope.search = "";

        getAppList();
        $scope.$watch("search", function (value) {
            searchService.setPhrase(value);
            init ? filterAppList() : init = true;
        });

        function getAppList() {
            $http.get("../data/steam-min.json")
                .then(function (response) {
                    let resp = response.data.applist.apps;
                    for (let i = 0; i < resp.length; i++) {
                        appList.push({
                            app: resp[i].app,
                            name: resp[i].name,
                            type: resp[i].type,
                            search: (resp[i].name).replace(/[^\w\s-]/gi, '')
                        });
                    }
                })
                .catch(function (error) { })
            init = true;
        };

        function filterAppList() {
            filterList = [];
            $rootScope.steamReady = false;
            gameListService.clearList();
            if ($scope.search.length >= 3) {
                filterList = $filter("filter")(appList, { search: $scope.search });
                mapList = filterList.map(id => id.app);
                getGameList();
            } else {
                mapList = [];
                $rootScope.steamReady = true;
            }
        };

        function getGameList() {
            if (mapList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/appdetails?appids=" + mapList.join(",") + "&filters=price_overview")
                    .then(function (response) {
                        for (let i = 0; i < mapList.length; i++) {
                            if (response.data[mapList[i]].success) {
                                gameListService.setList({
                                    name: filterList[i].name,
                                    app: filterList[i].app,
                                    type: filterList[i].type,
                                    price: response.data[mapList[i]].data.price_overview != undefined ? (response.data[mapList[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                    sale: response.data[mapList[i]].data.price_overview != undefined ? (response.data[mapList[i]].data.price_overview.discount_percent != 0 ? true : false) : false,
                                    platform: "Steam",
                                    link: "https://store.steampowered.com/app/" + filterList[i].app
                                });
                            }
                        }
                        $rootScope.steamReady = true;
                    })
                    .catch(function (error) { })
            } else {
                $rootScope.steamReady = true;
            }

        };
    })
    .controller("galaxyApiCtrl", function ($scope, $rootScope, $http, $filter, searchService, gameListService) {
        var appList = [];
        var init = false;

        $scope.search = "";

        $scope.$watch(function () {
            return searchService.getPhrase();
        },
            function (value) {
                $scope.search = value;
                init ? getAppList() : init = true;
            }
        );

        function getAppList() {
            appList = [];
            $rootScope.galaxyReady = false;
            if ($scope.search.length >= 3) {
                $http.get("http://rainbow.nazwa.pl:9000/https://embed.gog.com/games/ajax/filtered?mediaType=game&search=" + $scope.search)
                    .then(function (response) {
                        for (let i = 0; i < response.data.products.length; i++) {
                            appList.push(response.data.products[i]);
                        }
                        getGameList();
                    })
                    .catch(function (error) { })
            } else {
                $scope.game = gameListService.getList();
                $rootScope.galaxyReady = true;
            }
        };

        function getGameList() {
            if (appList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids=" + appList.map(id => id.id).join(","))
                    .then(function (response) {
                        for (let i = 0; i < appList.length; i++) {
                            gameListService.setList({
                                name: appList[i].title,
                                app: appList[i].id,
                                type: response.data[i].game_type,
                                price: appList[i].price.amount,
                                sale: appList[i].price.isDiscounted,
                                platform: "GOG",
                                link: "https://www.gog.com" + appList[i].url
                            });
                        }
                        $rootScope.galaxyReady = true;
                    })
                    .catch(function (error) { })
            } else {
                $rootScope.galaxyReady = true;
            }
            $scope.game = gameListService.getList();
        };
    });