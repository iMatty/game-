angular.module("gamesTable").component("gamesTable", {
    bindings: {
        games: "=",
        removalOnly: "<"
    },
    templateUrl: "modules/gamesTable/gamesTable.template.html",
    controller: ["$scope", function($scope) {
        this.dtOptions = {
            searching: false,
            destroy: true,
            language: {
                emptyTable: "No results found",
                info: "Total results found: _MAX_",
                infoEmpty: ""
            }
        };
    }]
});