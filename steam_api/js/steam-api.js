var appList = [];
var filterList = [];
var mapList = [];
var gameList = [];

angular.module("steamApi", ["angular.filter"])
    .controller("steamApiCtrl", function ($scope, $http, $filter) {
        $scope.search = "";
        getAppList();
        $scope.$watch("search", function () {
            filterAppList();
        });

        function getAppList() {
            $http.get("./data/steam-min.json")
                .then(function (response) {
                    appList = response.data.applist.apps;
                })
                .catch(function (error) { })
        };

        function filterAppList() {
            if ($scope.search.length >= 3) {
                filterList = $filter("filter")(appList, { name: $scope.search });
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
                                    price: (response.data[mapList[i]].data.price_overview.final / 100).toFixed(2)
                                })
                            } else {
                                gameList.push({
                                    name: filterList[i].name,
                                    app: filterList[i].app,
                                    type: filterList[i].type,
                                    price: "-"
                                })
                            }
                        }
                    }
                })
                .catch(function (error) { })
            $scope.game = gameList;
        };
    });