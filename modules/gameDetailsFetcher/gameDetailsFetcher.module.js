angular.module("gameDetailsFetcher", ["filterUnique"])
    .run(["steamApi", "$http", function(steamApi, $http) {
        $http.get("../data/steam.min.json")
            .then(function (response) {
                loadSteamApi(response.data.applist.apps);
                steamApi.initialized = true;
        });

        function loadSteamApi(appList) {
            for(let i=0; i< appList.length; i++) {
                steamApi.apps.push({
                    app: appList[i].app,
                    name: appList[i].name,
                    type: appList[i].type,
                    search: (appList[i].name).replace(/[^\w\s-]/gi, '')
                });
            };
        }
    }]);