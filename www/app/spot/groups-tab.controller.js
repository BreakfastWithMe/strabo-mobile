(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupsController', SpotTabGroupsController);

  SpotTabGroupsController.$inject = ['$scope', '$stateParams', '$log', 'CurrentSpot'];

  function SpotTabGroupsController($scope, $stateParams, $log, CurrentSpot) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab groups Controller');

    vm.linkGroup = function () {
      CurrentSpot.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupModal');
    };
  }
}());
