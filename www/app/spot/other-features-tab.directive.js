(function () {
  'use strict';

  angular
    .module('app')
    .directive('straboOtherFeaturesTabDirective', straboOtherFeaturesTabDirective);

  function straboOtherFeaturesTabDirective() {
    return {
      'restrict': 'AE',
      'replace': true,
      'templateUrl': 'app/spot/other-features-tab.directive.html'
    };
  }
}());