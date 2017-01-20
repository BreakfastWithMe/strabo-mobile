(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboOtherMapsDirective', straboOtherMapsDirective);

  function straboOtherMapsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/map/other-maps.directive.html'
    };
  }
}());