angular.module("galaxyApi", ["angular.filter"])
    .controller("galaxyApiCtrl", function ($scope, $http, $filter) {
        var appList = [];
        var gameList = [];
        var init = false;

        $scope.search = "";

        $scope.$watch("search", function () {
            init ? getAppList() : init = true;
        });

        function getAppList() {
            appList = [];
            gameList = [];
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
                $scope.game = gameList;
            }
        };

        function getGameList() {
            if (appList.length != 0) {
                $http.get("http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids=" + appList.map(id => id.id).join(","))
                    .then(function (response) {
                        for (let i = 0; i < appList.length; i++) {
                            gameList.push({
                                name: appList[i].title,
                                app: appList[i].id,
                                type: response.data[i].game_type,
                                price: appList[i].price.amount,
                                sale: appList[i].price.isDiscounted
                            });
                        }
                    })
                    .catch(function (error) { })
            }
            $scope.game = gameList;
        };
    });