angular.module("gameDetailsFetcher")
    .factory("gameDetailsFetcher", ["$rootScope", "$q", "$http", "$filter", "steamApi",
                                    function($rootScope, $q, $http, $filter, steamApi) {

        $rootScope.$watch(() => steamApi.initialized,
                    (initialized) => gameDetailsFetcher.initialized = initialized);

        function gameDetailsFetcher() {
            let galaxyReady = true;
            let steamReady = true;
            let canceler = $q.defer();
            let vm = this;

            gameDetailsFetcher.initialized = false;

            vm.data = [];
            vm.dataReady = true;
            vm.initialized = function() {
                return gameDetailsFetcher.initialized
            };
            vm.fetchBySearchTerm = function(searchTerm) {
                reinitialize();
                getSteamDetailsBySearchTerm(searchTerm);
                getGogDetailsBySearchTerm(searchTerm);
            },
            vm.fetchByIds = function (gogIds, steamIds) {
                reinitialize();
            };

            $rootScope.$watch(() => steamReady && galaxyReady,
                (dataReady) => vm.dataReady = dataReady);

            function reinitialize() {
                canceler.resolve();
                canceler = $q.defer();
                galaxyReady = steamReady = false;
                vm.data = [];
                vm.dataReady = false;
            }

            function getSteamDetailsBySearchTerm(searchTerm) {
                let storeSearchItems = [];
                $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/storesearch/?term="
                    + searchTerm, timeout: canceler.promise})
                    .then(function(response) {
                        response.data.items.forEach(function(app) {
                            let find = steamApi.apps.find(id => (id.app == app.id));
                            if (find != null) {
                                storeSearchItems.push(find);
                            }
                        });
                        completeSteamListAndProceed(storeSearchItems, searchTerm);
                    });
            }

            function completeSteamListAndProceed(storeSearchItems, searchTerm) {
                let appList = $filter("filter")(steamApi.apps, { search: searchTerm });
                appList = storeSearchItems.concat(appList);
                appList = $filter("unique")(appList);
                appList = $filter("limitTo")(appList, 50);
                getSteamDetailsByIds(appList);
            }

            function getSteamDetailsByIds(appList) {
                let ids = appList.map(id => id.app);
                if (ids.length > 0) {
                    $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/appdetails?appids="
                        + ids.join(",") + "&filters=price_overview", timeout: canceler.promise })
                        .then(function(response) {
                            for (let i = 0; i < ids.length; i++) {
                                if(response.data[ids[i]].success) {
                                    vm.data.push({
                                        name: appList[i].name,
                                        app: appList[i].app,
                                        type: appList[i].type,
                                        price: response.data[ids[i]].data.price_overview != undefined ? (response.data[ids[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                        sale: response.data[ids[i]].data.price_overview != undefined ? response.data[ids[i]].data.price_overview.discount_percent : 0,
                                        platform: "Steam",
                                        link: "https://store.steampowered.com/app/" + appList[i].app,
                                        image: "https://steamcdn-a.akamaihd.net/steam/apps/" + appList[i].app + "/header.jpg"
                                    });
                                }
                            }
                            steamReady = true;
                        });
                } else {
                    steamReady = true;
                }
            }

            function getGogDetailsBySearchTerm(searchTerm) {
                let appList = [];
                $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://embed.gog.com/games/ajax/filtered?mediaType=game&search="
                    + searchTerm, timeout: canceler.promise })
                    .then(function(response) {
                        response.data.products.forEach(function(app){
                            appList.push(app);
                        });
                        getGogDetailsByIds(appList);
                    });
            }

            function getGogDetailsByIds(appList) {
                let ids = appList.map(id => id.id);
                if(ids.length > 0) {
                    $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids="
                        + ids.join(","), timeout: canceler.promise})
                        .then(function(response) {
                            for(let i = 0; i < response.data.length; i++) {
                                vm.data.push({
                                    name: appList[i].title,
                                    app: appList[i].id,
                                    type: response.data[i].game_type,
                                    price: appList[i].price.amount,
                                    sale: appList[i].price.discountPercentage,
                                    platform: "GOG",
                                    link: response.data[i].links.product_card,
                                    image: response.data[i].images.logo2x.substring(0,
                                        response.data[i].images.logo2x.indexOf('_')) + "_product_quartet_250.jpg"
                                });
                            }
                            galaxyReady = true;
                        });
                } else {
                    galaxyReady = true;
                }
            }
        }

       return gameDetailsFetcher;
    }]);