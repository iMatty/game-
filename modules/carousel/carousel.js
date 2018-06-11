angular.module("carousel", [])
    .controller("carouselCtrl", function ($scope, $http) {

        var topList = [];
        getTopList();

        function getTopList() {
            $http.get("http://rainbow.nazwa.pl:9000/https://store.steampowered.com/api/featuredcategories/")
                .then(function (response) {
                    for (let i = 0; i < response.data.specials.items.length; i++) {
                        topList.push(response.data.specials.items[i]);
                    }
                })
                .catch(function (error) { })
            $scope.carouselList = topList;
        }
    })
    .directive("owlCarousel", ["$timeout", function ($timeout) {
        return {
            restrict: "E",
            transclude: false,
            link: function (scope) {
                scope.initCarousel = function (element) {
                    $timeout(function () {
                        var defaultOptions = {
                            margin: 10,
                            stagePadding: 50,
                            loop: true,
                            nav: true,
                            navText : ["<i class='fa fa-angle-left fa-4x'></i>","<i class='fa fa-angle-right fa-4x'></i>"],
                            dots: false,
                            autoplay: true,
                            autoplayTimeout: 10000,
                            autoplayHoverPause: true,
                            responsive: {
                                0: {
                                    items: 1
                                },
                                576: {
                                    items: 2
                                },
                                1024: {
                                    items: 3
                                },
                                1366: {
                                    items: 4
                                },
                                1600: {
                                    items: 5
                                }
                            }
                        };
                        var customOptions = scope.$eval($(element).attr("data-options"));
                        for (var key in customOptions) {
                            defaultOptions[key] = customOptions[key];
                        }
                        $(element).owlCarousel(defaultOptions);
                        scope.carouselShow = true;
                    }, 50);
                };
            }
        };
    }])
    .directive("owlCarouselItem", [function () {
        return {
            restrict: "A",
            transclude: false,
            link: function (scope, element) {
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }]);