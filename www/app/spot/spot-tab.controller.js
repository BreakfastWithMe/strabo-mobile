(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabController', SpotTabController);

  SpotTabController.$inject = ['$cordovaGeolocation', '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory',
    'ProjectFactory', 'SpotFactory'];

  function SpotTabController($cordovaGeolocation, $ionicPopup, $log, $scope, $state, DataModelsFactory, ProjectFactory,
                             SpotFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.survey = DataModelsFactory.getDataModel('trace').survey;
    vmParent.choices = DataModelsFactory.getDataModel('trace').choices;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.getCurrentLocation = getCurrentLocation;
    vm.getRockUnits = getRockUnits;
    vm.mapped = false;
    vm.rockUnit = {};
    vm.rockUnits = {};
    vm.setFromMap = setFromMap;
    vm.setRockUnit = setRockUnit;
    vm.showLatLng = false;
    vm.showXY = false;
    vm.updateLatitude = updateLatitude;
    vm.updateLongitude = updateLongitude;
    vm.updateX = updateX;
    vm.updateY = updateY;
    vm.viewRockUnit = viewRockUnit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotTabController');

      getRockUnits();
      getRockUnit();

      // Has the spot been mapped yet?
      if (vmParent.spot.geometry) {
        if (vmParent.spot.geometry.coordinates) {
          // If the geometry coordinates contain any null values, delete the geometry; it shouldn't be defined
          if (_.indexOf(_.flatten(vmParent.spot.geometry.coordinates), null) !== -1) {
            delete vmParent.spot.geometry;
          }
          else {
            vm.mapped = true;
            // Only show Latitude and Longitude input boxes if the geometry type is Point
            if (vmParent.spot.geometry.type === 'Point') {
              if (_.has(vmParent.spot.properties, 'image_basemap')) {
                vm.showXY = true;
                vm.y = vmParent.spot.geometry.coordinates[1];
                vm.x = vmParent.spot.geometry.coordinates[0];
              }
              else {
                vm.showLatLng = true;
                vm.lat = vmParent.spot.geometry.coordinates[1];
                vm.lng = vmParent.spot.geometry.coordinates[0];
              }
            }
          }
        }
      }
    }

    function getRockUnit() {
      if (vmParent.spot.properties.rock_unit) {
        var selectedRockUnitIndex;
        _.each(vm.rockUnits, function (rockUnit, i) {
          if (rockUnit.unit_label_abbreviation === vmParent.spot.properties.rock_unit.unit_label_abbreviation) {
            selectedRockUnitIndex = i;
          }
        });
        vm.rockUnit = vm.rockUnits[selectedRockUnitIndex];
      }
    }

    /**
     * Public Functions
     */

    // Get current location of the user
    function getCurrentLocation() {
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        vm.lat = position.coords.latitude;
        vm.lng = position.coords.longitude;
        vmParent.spot.geometry = {
          'type': 'Point',
          'coordinates': [vm.lng, vm.lat]
        };
        vm.showLatLng = true;
        vm.mapped = true;
      }, function (err) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': 'Unable to get location: ' + err.message
        });
      });
    }

    // Open the map so the user can set the location for the spot
    function setFromMap() {
      SpotFactory.moveSpot = true;
      if (_.has(vmParent.spot.properties, 'image_basemap')) {
        vmParent.submit('/app/image-basemaps/' + vmParent.spot.properties.image_basemap);
      }
      else vmParent.submit('/app/map');
    }

    function getRockUnits() {
      vm.rockUnits = _.clone(ProjectFactory.getRockUnits());
      vm.rockUnits.push({'unit_label_abbreviation': '-- new rock unit --'});
    }

    function setRockUnit() {
      if (!vm.rockUnit) delete vmParent.spot.properties.rock_unit;
      else if (vm.rockUnit.unit_label_abbreviation === '-- new rock unit --') {
        $state.go('app.new-rock-unit');
      }
      else vmParent.spot.properties.rock_unit = vm.rockUnit;
    }

    // Update the value for the Latitude from the user input
    function updateLatitude(lat) {
      vmParent.spot.geometry.coordinates[1] = lat;
    }

    // Update the value for the Longitude from the user input
    function updateLongitude(lng) {
      vmParent.spot.geometry.coordinates[0] = lng;
    }

    // Update the value for the x from the user input
    function updateX(x) {
      vmParent.spot.geometry.coordinates[0] = x;
    }

    // Update the value for the Longitude from the user input
    function updateY(y) {
      vmParent.spot.geometry.coordinates[1] = y;
    }

    function viewRockUnit() {
      vmParent.submit('/app/manage-project/' + vmParent.spot.properties.rock_unit.unit_label_abbreviation);
    }
  }
}());
