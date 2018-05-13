angular.module("gamesApi", ["angular.filter", "datatables"])
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
        var list = { gameList: [] };

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
    .controller("steamApiCtrl", function ($scope, $http, $filter, searchService, gameListService) {
        var appList = [];
        var filterList = [];
        var mapList = [];
        var init = false;

        $scope.search = "";

        getAppList();
        $scope.$watch("search", function (value) {
            init ? filterAppList() : init = true;
            searchService.setPhrase(value);
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
            gameListService.clearList();
            if ($scope.search.length >= 3) {
                filterList = $filter("filter")(appList, { search: $scope.search });
                mapList = filterList.map(id => id.app);
                getGameList();
            } else {
                mapList = [];
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
                                    link: "https://store.steampowered.com/app/" + filterList[i].app
                                });
                            }
                        }
                    })
                    .catch(function (error) { })
            }
        };
    })
    .controller("galaxyApiCtrl", function ($scope, $http, $filter, searchService, gameListService) {
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
                                link: "https://www.gog.com" + appList[i].url
                            });
                        }
                    })
                    .catch(function (error) { })
            }
            $scope.game = gameListService.getList();
        };
    });