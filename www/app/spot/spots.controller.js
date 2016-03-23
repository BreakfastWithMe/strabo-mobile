(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotsController', Spots);

  Spots.$inject = ['$cordovaDevice', '$cordovaFile', '$document', '$ionicModal', '$ionicPopover', '$ionicPopup',
    '$location', '$log', '$scope', '$window', 'ProjectFactory', 'SpotFactory', 'UserFactory'];

  function Spots($cordovaDevice, $cordovaFile, $document, $ionicModal, $ionicPopover, $ionicPopup, $location, $log,
                 $scope, $window, ProjectFactory, SpotFactory, UserFactory) {
    var vm = this;

    var visibleDatasets = [];

    vm.activeDatasets = [];
    vm.checkedDataset = checkedDataset;
    vm.closeModal = closeModal;
    vm.deleteAllActiveSpots = deleteAllActiveSpots;
    vm.deleteSelected = false;
    vm.deleteSpot = deleteSpot;
    vm.exportToCSV = exportToCSV;
    vm.filter = filter;
    vm.filterModal = {};
    vm.filterOn = false;
    vm.goToSpot = goToSpot;
    vm.isDatasetChecked = isDatasetChecked;
    vm.isOnlineLoggedIn = isOnlineLoggedIn;
    vm.loadMoreSpots = loadMoreSpots;
    vm.moreSpotsCanBeLoaded = moreSpotsCanBeLoaded;
    vm.newSpot = newSpot;
    vm.spots = [];
    vm.spotsDisplayed = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      SpotFactory.clearCurrentSpot();           // Make sure the current spot is empty
      visibleDatasets = SpotFactory.getVisibleDatasets();
      setVisibleSpots();
      createPopover();

      $ionicModal.fromTemplateUrl('app/spot/spots-filter-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.filterModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.filterModal.remove();
      });
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/spot/spots-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
    }

    function setVisibleSpots() {
      var activeSpots = SpotFactory.getActiveSpots();
      if (_.isEmpty(visibleDatasets)) {
        vm.spots = activeSpots;
        vm.filterOn = false;
      }
      else {
        var datasetIdsToSpotIds = ProjectFactory.getSpotIds();
        var visibleSpotsIds = [];
        _.each(visibleDatasets, function (visibleDataset) {
          visibleSpotsIds.push(datasetIdsToSpotIds[visibleDataset]);
        });
        visibleSpotsIds = _.flatten(visibleSpotsIds);
        vm.spots = _.filter(activeSpots, function (activeSpot) {
          return _.contains(visibleSpotsIds, activeSpot.properties.id);
        });
        vm.filterOn = true;
      }
      _.sortBy(vm.spots, function (spot) {
        return spot.properties.modified_timestamp;
      }).reverse();
      vm.spotsDisplayed = angular.fromJson(angular.toJson(vm.spots)).slice(0, 20);
    }

    /**
     * Public Functions
     */

    function checkedDataset(dataset) {
      $log.log('visibleDatasets:', visibleDatasets);
      var i = _.indexOf(visibleDatasets, dataset);
      if (i === -1) visibleDatasets.push(dataset);
      else visibleDatasets.splice(i, 1);
      SpotFactory.setVisibleDatasets(visibleDatasets);
      $log.log('visibleDatasets after:', visibleDatasets);
    }

    function closeModal() {
      setVisibleSpots();
      vm.filterModal.hide();
    }

    // clears all spots
    function deleteAllActiveSpots() {
      vm.popover.hide();
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spots',
        'template': 'Are you sure you want to delete <b>ALL</b> active spots? This will also delete any associated image basemaps.'
      });
      confirmPopup.then(
        function (res) {
          if (res) {
            SpotFactory.clearActiveSpots().then(function () {
              // update the spots list
              vm.spots = [];
              vm.spotsDisplayed = [];
            });
          }
        }
      );
    }

    function deleteSpot(spot) {
      vm.deleteSelected = true;

      if (SpotFactory.isSafeDelete(spot)) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Spot',
          'template': 'Are you sure you want to delete Spot ' + spot.properties.name + '?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            SpotFactory.destroy(spot.properties.id).then(function () {
              vm.spots = SpotFactory.getActiveSpots();
              vm.spotsDisplayed = angular.fromJson(angular.toJson(vm.spots)).slice(0, 20);
            });
          }
          vm.deleteSelected = false;
        });
      }
      else {
        var alertPopup = $ionicPopup.alert({
          'title': 'Spot Deletion Prohibited!',
          'template': 'This Spot has at least one image being used as an image basemap. Remove any image basemaps' +
          ' from this Spot before deleting.'
        });
        alertPopup.then(function () {
          vm.deleteSelected = false;
        });
      }
    }

    // Export data to CSV
    function exportToCSV() {
      vm.popover.hide();
      // Convert the spot objects to a csv format
      function convertToCSV() {
        // Get all the fields for the csv header row
        var allHeaders = [];
        _.each(vm.spots,
          function (spot) {
            var headers = _.keys(spot.properties);
            // If there are custom fields, loop through the custom object grabbing those fields
            var i = _.indexOf(headers, 'custom');
            if (i !== -1) {
              headers = _.without(headers, 'custom');
              var customHeaders = _.keys(spot.properties.custom);
              customHeaders = _.map(customHeaders,
                function (header) {
                  return 'custom_' + header;
                }
              );
              allHeaders = _.union(headers, allHeaders, customHeaders);
            }
            else {
              allHeaders = _.union(headers, allHeaders);
            }
          }
        );
        // Add the two fields for the geometry
        allHeaders.push('geometry_type');
        allHeaders.push('geometry_coordinates');

        var allHeadersQuoted = _.map(allHeaders,
          function (ele) {
            return '\'' + ele + '\'';
          }
        );
        var csv = allHeadersQuoted.toString() + '\r\n';

        // Get all the values for each csv data row
        _.each(vm.spots,
          function (spot) {
            var row = new Array(allHeaders.length);
            row = _.map(row,
              function (ele) {
                return '';
              }
            );
            _.each(spot.properties,
              function (value, key) {
                // If the value is actually an object
                var i = _.indexOf(allHeaders, key);
                if (_.isObject(value)) {
                  // Separate date parts
                  if (value instanceof Date) {
                    if (key === 'time') {
                      row[i] = value.toLocaleTimeString();
                    }
                    else if (key === 'date') {
                      row[i] = value.toLocaleDateString();
                    }
                    else {
                      row[i] = value.toJSON();
                    }
                  }
                  // Flatten the child values
                  else {
                    row[i] = '\'' + _.flatten(value).join(', ') + '\'';
                  }
                }
                else {
                  row[i] = '\'' + value + '\'';
                }
              }
            );
            // Add the values for the geometry fields
            if (angular.isDefined(spot.geometry) && angular.isDefined(spot.geometry.type)) {
              var i = _.indexOf(allHeaders, 'geometry_type');
              row[i] = '\'' + spot.geometry.type + '\'';
              if (angular.isDefined(spot.geometry.coordinates)) {
                i = _.indexOf(allHeaders, 'geometry_coordinates');
                row[i] = '\'' + _.flatten(spot.geometry.coordinates).join(', ') + '\'';
              }
            }
            csv += row.toString() + '\r\n';
          }
        );
        return csv;
      }

      var spotData = convertToCSV(vm.spots);

      // If this is a web browser and not using cordova
      if ($document[0].location.protocol !== 'file:') { // Phonegap is not present }
        spotData = spotData.replace(/\r\n/g, '<br>');
        var win = $window.open();
        win.document.body.innerHTML = spotData;
        return;
      }

      var d = new Date();
      d = d.toLocaleDateString() + '-' + d.toLocaleTimeString();
      d = d.replace(/\//g, '-');
      d = d.replace(/:/g, '');
      d = d.replace(/ /g, '');
      var fileName = d + '-' + 'strabo-data.csv';

      var devicePath;
      switch ($cordovaDevice.getPlatform()) {
        case 'Android':
          devicePath = cordova.file.externalRootDirectory;
          break;
        case 'iOS':
          devicePath = cordova.file.documentsDirectory;
          break;
        default:
          // uh oh?  TODO: what about windows and blackberry?
          devicePath = cordova.file.externalRootDirectory;
          break;
      }

      var directory = 'strabo';

      function writeFile(dir) {
        $cordovaFile.writeFile(devicePath + dir, fileName, spotData, true).then(
          function (success) {
            $log.log(success);
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'CSV written to ' + devicePath + dir + fileName
            });
          },
          function (error) {
            $log.log(error);
          }
        );
      }

      $cordovaFile.checkDir(devicePath, directory).then(
        function (success) {
          $log.log(success);
          writeFile(success.fullPath);
        },
        function (error) {
          $cordovaFile.createDir(devicePath, directory, false).then(
            function (success) {
              $log.log(success);
              writeFile(success.fullPath);
            },
            function (error) {
              $log.log(error);
            }
          );
        }
      );
    }

    function filter() {
      vm.activeDatasets = ProjectFactory.getActiveDatasets();
      vm.filterModal.show();
    }

    function goToSpot(id) {
      if (!vm.deleteSelected) {
        $location.path('/app/spotTab/' + id + '/spot');
      }
    }

    function isDatasetChecked(id) {
      return _.find(visibleDatasets, function (visibleDataset) {
        return visibleDataset === id;
      });
    }

    // Is the user online and logged in
    function isOnlineLoggedIn() {
      return navigator.onLine && UserFactory.getUser();
    }

    function loadMoreSpots() {
      var moreSpots = angular.fromJson(angular.toJson(vm.spots)).splice(vm.spotsDisplayed.length,
        vm.spotsDisplayed.length + 20);
      vm.spotsDisplayed = _.union(vm.spotsDisplayed, moreSpots);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    function moreSpotsCanBeLoaded() {
      return vm.spotsDisplayed.length !== vm.spots.length;
    }

    // Create a new Spot
    function newSpot() {
      SpotFactory.setNewSpot({}).then(function (id) {
        $location.path('/app/spotTab/' + id + '/spot');
      });
    }
  }
}());
