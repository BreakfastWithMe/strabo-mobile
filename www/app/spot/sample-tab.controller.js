(function () {
  'use strict';

  angular
    .module('app')
    .controller('SampleTabController', SampleTabController);

  SampleTabController.$inject = ['$log', '$scope', '$state'];

  function SampleTabController($log, $scope, $state) {
    var vmParent = $scope.vm;
    vmParent.loadTab($state);     // Need to load current state into parent

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SampleTabController');
    }
  }
}());