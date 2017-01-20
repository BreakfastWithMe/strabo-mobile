(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboRelationshipDirective', straboRelationshipDirective);

  function straboRelationshipDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/tag-relationship/relationship.directive.html'
    };
  }
}());