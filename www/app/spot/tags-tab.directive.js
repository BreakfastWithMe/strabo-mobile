(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsTabDirective', straboTagsTabDirective);

  function straboTagsTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/tags-tab.directive.html'
    };
  }
}());