angular.module("gameDetailsFetcher")
    .factory("gameDetailsFetcher", ["$rootScope", "$timeout", "$q", "$http", "$filter", "steamApi",
                                    function($rootScope, $timeout, $q, $http, $filter, steamApi) {

        $rootScope.$watch(() => steamApi.initialized,
                    (initialized) => gameDetailsFetcher.initialized = initialized);

        function gameDetailsFetcher(baseData) {
            let galaxyReady = true;
            let steamReady = true;
            let canceler = $q.defer();
            let vm = this;

            gameDetailsFetcher.initialized = false;

            vm.data = baseData || {};
            vm.dataReady = true;
            vm.length = 0;
            vm.initialized = function() {
                return gameDetailsFetcher.initialized
            };
            vm.fetchBySearchTerm = function(searchTerm) {
                reinitialize();
                getSteamDetailsBySearchTerm(searchTerm);
                getGogDetailsBySearchTerm(searchTerm);
            };
            vm.fetchByIds = function(appList) {
                reinitialize();
                getSteamDetailsByIds($filter("filter")(appList, { platform: "Steam" }));
                getGogDetailsByIds($filter("filter")(appList, { platform: "GOG" }));
            };
            vm.fetchById = function(app) {
                switch(app.platform) {
                    case "Steam":
                        getSteamDetailsByIds([app]);
                        break;
                    case "GOG":
                        getGogDetailsById(app);
                        break;
                }
            };

            $rootScope.$watch(() => steamReady && galaxyReady,
                (dataReady) => vm.dataReady = dataReady);

            function reinitialize() {
                canceler.resolve();
                canceler = $q.defer();
                galaxyReady = steamReady = false;
                vm.data = {};
                vm.dataReady = false;
                vm.length = 0;
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
                    })
                    .catch(function() {});
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
                            $timeout(() => { $rootScope.$apply(() =>  {
                                for (let i = 0; i < ids.length; i++) {
                                    if(response.data[ids[i]].success) {
                                        if(vm.data.hasOwnProperty("Steam-" + appList[i].app)) {
                                            let app = vm.data["Steam-" + appList[i].app];
                                            app.name = appList[i].name,
                                                app.price = response.data[ids[i]].data.price_overview != undefined ? (response.data[ids[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                                app.sale = response.data[ids[i]].data.price_overview != undefined ? response.data[ids[i]].data.price_overview.discount_percent : 0,
                                                app.link = "https://store.steampowered.com/app/" + appList[i].app,
                                                app.app.image = "https://steamcdn-a.akamaihd.net/steam/apps/" + appList[i].app + "/header.jpg"
                                        } else {
                                            vm.data["Steam-" + appList[i].app] = {
                                                name: appList[i].name,
                                                app: appList[i].app,
                                                type: appList[i].type,
                                                price: response.data[ids[i]].data.price_overview != undefined ? (response.data[ids[i]].data.price_overview.final / 100).toFixed(2) : (0).toFixed(2),
                                                sale: response.data[ids[i]].data.price_overview != undefined ? response.data[ids[i]].data.price_overview.discount_percent : 0,
                                                platform: "Steam",
                                                link: "https://store.steampowered.com/app/" + appList[i].app,
                                                image: "https://steamcdn-a.akamaihd.net/steam/apps/" + appList[i].app + "/header.jpg"
                                            };
                                        }
                                    }
                                    vm.length++;
                                }
                                steamReady = true;
                            }); }, 0, false);
                        })
                        .catch(function() {});
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
                    })
                    .catch(function() {});
            }

            function getGogDetailsByIds(appList) {
                let ids = appList.map(id => id.id);
                if(ids.length > 0) {
                    $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/http://api.gog.com/products?ids="
                                    + ids.join(","), timeout: canceler.promise})
                        .then(function(response) {
                            $timeout(() => { $rootScope.$apply(() =>  {
                                for (let i = 0; i < ids.length; i++) {
                                    if(vm.data.hasOwnProperty("GOG-" + (appList[i].id || appList[i].app))) {
                                        let app = vm.data["GOG-" + (appList[i].id || appList[i].app)];
                                        app.name = appList[i].title || appList[i].name,
                                        app.price = appList[i].price.amount,
                                        app.sale = appList[i].price.discountPercentage,
                                        app.link = response.data[i].links.product_card,
                                        app.app.image = response.data[i].images.logo2x.substring(0,
                                            response.data[i].images.logo2x.indexOf('_')) + "_product_quartet_250.jpg"
                                    } else {
                                        vm.data["GOG-" + (appList[i].id || appList[i].app)] = {
                                            name: appList[i].title || appList[i].name,
                                            app: appList[i].id || appList[i].app,
                                            type: response.data[i].game_type,
                                            price: appList[i].price.amount,
                                            sale: appList[i].price.discountPercentage,
                                            platform: "GOG",
                                            link: response.data[i].links.product_card,
                                            image: response.data[i].images.logo2x.substring(0,
                                                response.data[i].images.logo2x.indexOf('_')) + "_product_quartet_250.jpg"
                                        };
                                    }
                                    vm.length++;
                                }
                                galaxyReady = true;
                            }); }, 0, false);
                        })
                        .catch(function() {});
                } else {
                    galaxyReady = true;
                }
            }

            function getGogDetailsById(app) {
                $http({ method: "GET", url: "http://rainbow.nazwa.pl:9000/https://embed.gog.com/games/ajax/filtered?mediaType=game&search="
                                + app.name, timeout: canceler.promise})
                    .then(function(response) {
                        $timeout(() => { $rootScope.$apply(() =>  {
                            if(vm.data.hasOwnProperty("GOG-" + app.app)) {
                                let newApp = vm.data["GOG-" + app.app];
                                if(response.data.products[0] && response.data.products[0].price) {
                                    newApp.price = response.data.products[0].price.amount,
                                    newApp.sale = response.data.products[0].price.discountPercentage
                                } else {
                                    newApp.price = 0;
                                    newApp.sale = 0;
                                }
                            } else {
                                let sale, price
                                if(response.data.products[0] && response.data.products[0].price) {
                                    price = response.data.products[0].price.amount,
                                    sale = response.data.products[0].price.discountPercentage
                                } else {
                                    price = 0;
                                    sale = 0;
                                }
                                vm.data["GOG-" + app.app] = {
                                    name: app.name,
                                    app: app.app,
                                    type: app.type,
                                    price: price,
                                    sale: sale,
                                    platform: "GOG",
                                    link: app.link,
                                    image: app.image
                                };
                            }
                            vm.length++;
                            galaxyReady = true;
                        }); }, 0, false);
                    })
                    .catch(function() {});
            }
        }

       return gameDetailsFetcher;
    }]);