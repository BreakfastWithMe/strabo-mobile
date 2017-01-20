(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsDirective', straboTagsDirective);

  function straboTagsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/tags.directive.html'
    };
  }
}());