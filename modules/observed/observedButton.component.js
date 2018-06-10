angular.module("observed").component("observedButton", {
		bindings: {
			app: "<",
			removalOnly: "<"
		},
		templateUrl: "modules/observed/observedButton.template.html",
		controller: ["$scope", "observedList", function($scope, observedList) {
			let vm = this;
			this.confirm = false;
			this.$onInit = function() {
				vm.removalOnly = vm.removalOnly || false;
                vm.key = observedList.key(vm.app.platform, vm.app.app);
                vm.isObserved = null;
                $scope.$watch(
                    () => (observedList.isObserved(vm.key) ),
                    (isObserved) => {vm.isObserved = isObserved;}
                );
                vm.addToObserved = function() {
                    observedList.add(vm.key, vm.app);
                }
                vm.removeFromObserved = function() {
                    observedList.remove(vm.key);
                }
			}
		}]
	});