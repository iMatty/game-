angular.module("gamesTable").component("gamesTable", {
    bindings: {
        games: "=",
        removalOnly: "<"
    },
    templateUrl: "modules/gamesTable/gamesTable.template.html",
});