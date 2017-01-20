(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboToolsDirective', straboToolsDirective);

  function straboToolsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/project/tools.directive.html'
    };
  }
}());