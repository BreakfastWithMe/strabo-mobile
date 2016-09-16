(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboTagsListPropertiesDirective', straboTagsListPropertiesDirective);

  function straboTagsListPropertiesDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/tags-list-properties.directive.html'
    };
  }
}());
