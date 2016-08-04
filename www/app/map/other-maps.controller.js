(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherMapsController', OtherMapsController);

  OtherMapsController.$inject = ['$http', '$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$scope',
    'MapFactory', 'OtherMapsFactory', 'UserFactory'];

  function OtherMapsController($http, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $scope, MapFactory,
                               OtherMapsFactory, UserFactory) {
    var vm = this;
    var deleteSelected = false;
    var isEdit = false;

    vm.addMap = addMap;
    vm.addMapModal = {};
    vm.closeModal = closeModal;
    vm.data = {};
    vm.deleteMap = deleteMap;
    vm.editMap = editMap;
    vm.helpText = '';
    vm.mapSources = [{
      'name': 'Mapbox Classic',
      'source': 'mapbox_classic'
    }];
    vm.modalTitle = 'Add a Mapbox Classic Map';
    vm.openModal = openModal;
    vm.otherMaps = [];
    vm.save = save;
    vm.showHelpText = false;
    vm.toggleHelpText = toggleHelpText;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      createModals();
      cleanupModals();
      setHelpText();
      OtherMapsFactory.loadOtherMaps().then(function () {
        vm.otherMaps = OtherMapsFactory.getOtherMaps();
      });
    }

    function cleanupModals() {
      $scope.$on('addMapModal.hidden', function () {
        vm.addMapModal.remove();
      });
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/map/add-map-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.addMapModal = modal;
      });
    }

    function getMapboxId() {
      var user = UserFactory.getUser();
      $log.log('Loaded user: ', user);
      if (user && user.mapboxToken) {
        vm.data.key = user.mapboxToken;
        $log.log('Mapbox token: ', vm.data.key);
      }
    }

    function isNewMapId() {
      var match = _.find(vm.otherMaps, function (otherMap) {
        return otherMap.id === vm.data.id;
      });
      if (_.isEmpty(match)) {
        if (!MapFactory.getMaps()) MapFactory.setMaps();
        match = _.find(MapFactory.getMaps(), function (map) {
          return map.id === vm.data.id;
        });
      }
      return _.isEmpty(match);
    }

    function setHelpText() {
      vm.helpText = 'If you haven\'t done so already, create a Mapbox account. Create a Mapbox Classic map. Under' +
        ' Account in Mapbox also create an API access token. The title used for the map is up to you but shorter' +
        ' titles are better. The Map ID and Access Token you\'ll need to get from your Mapbox account. Save your' +
        ' Mapbox access token in your Strabo user profile to auto-populate this field.';
    }

    function testMapConnection(testUrl) {
      var deferred = $q.defer(); // init promise
      $log.log('Trying to connect to a new map ...');
      var request = $http({
        'method': 'get',
        'url': testUrl
      });
      request.then(function successCallback(response) {
        $log.log('Passed Connection Test - Response: ', response);
        $ionicLoading.hide();
        deferred.resolve();
      }, function errorCallback(response) {
        $log.log('Failed Connection Test - Response: ', response);
        $ionicPopup.alert({
          'title': 'Connection Error!',
          'template': 'Not able to connect to this map. Check your connection parameters.'
        });
        $ionicLoading.hide();
        deferred.reject();
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function addMap() {
      isEdit = false;
      vm.modalTitle = 'Add a Mapbox Classic Map';
      vm.data = {};
      getMapboxId();
      vm.openModal('addMapModal');
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function deleteMap(id) {
      deleteSelected = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Map',
        'template': 'Are you sure you want to delete this map?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vm.otherMaps = _.reject(vm.otherMaps, function (otherMap) {
            return otherMap.id === id;
          });
          OtherMapsFactory.setOtherMaps(vm.otherMaps);
        }
        deleteSelected = false;
      });
    }

    function editMap(map) {
      if (!deleteSelected) {
        isEdit = true;
        vm.modalTitle = 'Edit Mapbox Classic Map';
        vm.data = angular.copy(map);  // Copy value, not reference
        vm.openModal('addMapModal');
      }
    }

    function openModal(modal) {
      vm.showHelpText = false;
      vm[modal].show();
    }

    function save() {
      if (!vm.data.title || !vm.data.id || !vm.data.key) {
        $ionicPopup.alert({
          'title': 'Incomplete Map Info!',
          'template': 'The map Title, ID and Access Token are all required fields.'
        });
      }
      else if (isEdit || isNewMapId()) {
        vm.data.source = vm.mapSources[0].source;
        var mapProvider = MapFactory.getMapProviderInfo(vm.data.source);
        var testUrl;
        switch (vm.data.source) {
          case 'mapbox_classic':
            testUrl = mapProvider.apiUrl + vm.data.id + '.json?access_token=' + vm.data.key;
            break;
        }
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Testing Connection...'});
        testMapConnection(testUrl).then(function () {
          vm.otherMaps = _.reject(vm.otherMaps, function (otherMap) {
            return otherMap.id === vm.data.id;
          });
          vm.otherMaps.push(angular.copy(vm.data));
          OtherMapsFactory.setOtherMaps(vm.otherMaps);
          closeModal('addMapModal');
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Duplicate Map Id!',
          'template': 'The map id <b>' + vm.data.id + '</b> is already being used for a map.'
        });
      }
    }

    function toggleHelpText() {
      vm.showHelpText = !vm.showHelpText;
    }
  }
}());