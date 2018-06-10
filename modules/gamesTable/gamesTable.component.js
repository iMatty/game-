angular.module("gamesTable").component("gamesTable", {
    bindings: {
        games: "=",
        removalOnly: "<"
    },
    templateUrl: "modules/gamesTable/gamesTable.template.html",
    controller: function() {
        this.dtOptions = {
            searching: false,
            destroy: true,
            language: {
                emptyTable: "No results found",
                info: "Total results found: _MAX_",
                infoEmpty: ""
            }
        };
    }
});