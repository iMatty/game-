angular.module("observed").component("observedButton", {
		bindings: {
			platform: "<",
			app: "<",
			type: "<",
			removalOnly: "<"
		},
		templateUrl: "modules/observed/observedButton.template.html",
		controller: ["$scope", "observedList", function($scope, observedList) {
			let vm = this;
			this.confirm = false;
			this.$onInit = function() {
				vm.removalOnly = vm.removalOnly || false;
                vm.key = observedList.key(vm.platform, vm.app);
                vm.isObserved = null;
                $scope.$watch(
                    () => (observedList.isObserved(vm.key) ),
                    (isObserved) => {vm.isObserved = isObserved;}
                );
                vm.addToObserved = function() {
                    observedList.add(vm.platform, vm.app, vm.type);
                }
                vm.removeFromObserved = function() {
                    observedList.remove(vm.key);
                }
			}
		}]
	});