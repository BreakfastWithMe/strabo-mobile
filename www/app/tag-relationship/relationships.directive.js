(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboRelationshipsDirective', straboRelationshipsDirective);

  function straboRelationshipsDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/relationships.directive.html'
    };
  }
}());