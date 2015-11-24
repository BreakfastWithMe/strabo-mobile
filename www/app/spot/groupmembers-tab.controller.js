(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabGroupmembersController', SpotTabGroupmembersController);

  SpotTabGroupmembersController.$inject = ['$scope', '$stateParams', '$log', 'SpotFactory'];

  function SpotTabGroupmembersController($scope, $stateParams, $log, SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab group members Controller');

    vm.addGroupMember = function () {
      SpotFactory.setCurrentSpot(vmParent.spot);
      vmParent.openModal('groupMembersModal');
    };
  }
}());
