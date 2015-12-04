(function () {
  'use strict';

  angular
    .module('app')
    .controller('RockUnitController', RockUnitController);

  RockUnitController.$inject = ['$ionicPopup', '$log', '$scope', '$state', 'FormFactory', 'ProjectFactory'];

  function RockUnitController($ionicPopup, $log, $scope, $state, FormFactory, ProjectFactory) {
    var vm = this;
    var key = 'unit_label_abbreviation';

    vm.choices = {};
    vm.data = {};
    vm.dataOriginal = {};
    vm.deleteRockUnit = deleteRockUnit;
    vm.goToRockUnits = goToRockUnits;
    vm.isPristine = isPristine;
    vm.newRockUnit = newRockUnit;
    vm.rockUnits = [];
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = ProjectFactory.getRockUnitsSurvey();
      vm.choices = ProjectFactory.getRockUnitsChoices();
      vm.rockUnits = ProjectFactory.getRockUnits();

      if ($state.current.name !== 'app.new-rock-unit') vm.data = loadRockUnit();
      vm.dataOriginal = vm.data;

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    // Get the rock unit description for current rock unit and remove this
    // from the current list of all rock units
    function loadRockUnit() {
      var rockUnit;
      vm.rockUnits = _.reject(vm.rockUnits, function (obj) {
        if (obj[key] === $state.params[key]) rockUnit = obj;
        return obj[key] === $state.params[key];
      });
      return rockUnit;
    }

    /**
     * Public Functions
     */

    function deleteRockUnit() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Rock Unit',
        'template': 'Are you sure you want to delete this rock unit?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.destroyRockUnit(key, vm.data[key]);
          $state.go('app.rock-units');
        }
      });
    }

    function goToRockUnits() {
      $state.go('app.rock-units');
    }

    function newRockUnit() {
      $log.log('new');
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var valid = true;
      _.each(vm.rockUnits, function (obj) {
        if (obj[key] === vm.data[key]) valid = false;
      });
      if (valid) {
        valid = FormFactory.validate(vm.survey, vm.data);
        if (valid) {
          vm.rockUnits.push(vm.data);
          ProjectFactory.saveRockUnits(vm.rockUnits);
          $state.go('app.rock-units');
        }
      }
      else {
        $ionicPopup.alert({
          'title': 'Duplicate Label Error!',
          'template': 'The label ' + vm.data[key] + ' is already being used for another rock unit. Use a different label.'
        });
      }
    }
  }
}());