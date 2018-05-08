angular.module("steamApi", ["angular.filter"])
    .controller("steamApiCtrl", function ($scope, $http, $filter) {
        var appList = [];
        var filterList = [];
        var mapList = [];
        var gameList = [];

        $scope.search = "";
        getAppList();
        $scope.$watch("search", function () {
            filterAppList();
        });

        function getAppList() {
            $http.get("https://firebasestorage.googleapis.com/v0/b/exampleproject-77f6d.appspot.com/o/steam-min.json?alt=media&token=8ec1809d-7693-459a-b895-3b57bc278fcd")
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
        };

        function filterAppList() {
            if ($scope.search.length >= 3) {
                filterList = $filter("filter")(appList, { search: $scope.search });
                mapList = filterList.map(id => id.app);
                gameList = [];
                getGameList();
            } else {
                filterList = [];
                mapList = [];
                gameList = [];
                $scope.game = gameList;
            }
        };

        function getGameList() {
            $http.get("https://store.steampowered.com/api/appdetails?appids=" + mapList.join(",") + "&filters=price_overview")
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
            $scope.game = gameList;
        };
    });