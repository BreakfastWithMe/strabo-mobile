(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboDescriptionDirective', straboDescriptionDirective);

  function straboDescriptionDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/project/description.directive.html'
    };
  }
}());