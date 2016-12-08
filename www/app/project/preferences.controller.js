(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$ionicPopup', '$location', '$log', '$scope', 'DataModelsFactory', 'FormFactory', 'ProjectFactory', 'SpotFactory'];

  function PreferencesController($ionicPopup, $location, $log, $scope, DataModelsFactory, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    var colorPicker = {};

    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.options = ['Tag', 'Surface Feature Type', 'Trace Feature Type'];
    vm.optionSelected = '';
    vm.pristine = true;
    vm.survey = [];
    vm.styles = [];
    vm.tags = {};
    vm.tagSelected = '';

    vm.getOptions = getOptions;
    vm.selectColor = selectColor;
    vm.setColor = setColor;
    vm.setStyles = setStyles;
    vm.showField = showField;
    vm.submit = submit;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.survey = DataModelsFactory.getDataModel('preferences').survey;
        vm.data = ProjectFactory.getPreferences();
      }
      vm.tags = ProjectFactory.getTags();
      vm.spots = SpotsFactory.getSpots();
    }

    /**
     * Public Functions
     */

    function getOptions() {
    /*  if (vm.optionSelected === 'Tag') {
        vm.tags = ProjectFactory.getTags();
      }*/
    }

    function selectColor() {
      colorPicker = $ionicPopup.show({
        title: 'Select a Color',
        templateUrl: 'app/project/color-picker.html',
        scope: $scope
      });
     // colorPicker.show();
    }

    function setColor(color) {
      $log.log(color);
      colorPicker.close();
      vm.styles.push({'type': vm.optionSelected, 'tag': vm.tagSelected, 'color': color});
    }

    function setStyles() {
      $location.path('app/preferences');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit(toPath) {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        ProjectFactory.saveProjectItem('preferences', vm.data).then(function () {
          if (toPath) $location.path(toPath);
        });
      }
    }

    function toggleAcknowledgeChecked(field) {
      vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
    }
  }
}());
