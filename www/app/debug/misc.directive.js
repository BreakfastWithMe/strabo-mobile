(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboMiscDirective', straboMiscDirective);

  function straboMiscDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/debug/misc.directive.html'
    };
  }
}());