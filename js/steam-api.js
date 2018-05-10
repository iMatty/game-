angular.module("steamApi", ["angular.filter"])
    .controller("steamApiCtrl", function ($scope, $http, $filter) {
        var appList = [];
        var filterList = [];
        var mapList = [];
        var gameList = [];
        var init = false;

        $scope.search = "";

        getAppList();
        $scope.$watch("search", function () {
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
            gameList = [];
            if ($scope.search.length >= 3) {
                filterList = $filter("filter")(appList, { search: $scope.search });
                mapList = filterList.map(id => id.app);
                getGameList();
            } else {
                mapList = [];
                $scope.game = gameList;
            }
        };

        function getGameList() {
            if (mapList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/appdetails?appids=" + mapList.join(",") + "&filters=price_overview")
                    .then(function (response) {
                        for (let i = 0; i < mapList.length; i++) {
                            if (response.data[mapList[i]].success) {
                                if (response.data[mapList[i]].data.price_overview != undefined) {
                                    gameList.push({
                                        name: filterList[i].name,
                                        app: filterList[i].app,
                                        type: filterList[i].type,
                                        price: (response.data[mapList[i]].data.price_overview.final / 100).toFixed(2),
                                        sale: (response.data[mapList[i]].data.price_overview.discount_percent != 0 ? true : false)
                                    });
                                } else {
                                    gameList.push({
                                        name: filterList[i].name,
                                        app: filterList[i].app,
                                        type: filterList[i].type,
                                        price: "-",
                                        sale: false
                                    });
                                }
                            }
                        }
                    })
                    .catch(function (error) { })
            }
            $scope.game = gameList;
        };
    });