(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'LocalStorageFactory', 'RemoteServerFactory'];

  function ProjectFactory($log, $q, LocalStorageFactory, RemoteServerFactory) {
    var currentDatasets = [];
    var currentProject = {};
    var activeDatasets = [];
    var defaultTypes = ['geomorhic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];
    var spotsDataset = {};
    var spotIds = {};
    var switchProject = false;
    var user = {};

    return {
      'addSpotToDataset': addSpotToDataset,
      'createNewDataset': createNewDataset,
      'createNewProject': createNewProject,
      'destroyDataset': destroyDataset,
      'destroyProject': destroyProject,
      'destroyOtherFeature': destroyOtherFeature,
      'destroyRockUnit': destroyRockUnit,
      'getActiveDatasets': getActiveDatasets,
      'getCurrentDatasets': getCurrentDatasets,
      'getCurrentProject': getCurrentProject,
      'getDefaultOtherFeatureTypes': getDefaultOtherFeatureTypes,
      'getPreferences': getPreferences,
      'getProjectName': getProjectName,
      'getProjectDescription': getProjectDescription,
      'getProjectTools': getProjectTools,
      'getOtherFeatures': getOtherFeatures,
      'getRockUnits': getRockUnits,
      'getSpotNumber': getSpotNumber,
      'getSamplePrefix': getSamplePrefix,
      'getSpotPrefix': getSpotPrefix,
      'getSpotsDataset': getSpotsDataset,
      'getSpotIds': getSpotIds,
      'incrementSpotNumber': incrementSpotNumber,
      'isSyncReady': isSyncReady,
      'loadProjectRemote': loadProjectRemote,
      'loadProjectsRemote': loadProjectsRemote,
      'prepProject': prepProject,                     // Run from app config
      'removeSpotFromDataset': removeSpotFromDataset,
      'saveActiveDatasets': saveActiveDatasets,
      'saveProjectItem': saveProjectItem,
      'saveSpotsDataset': saveSpotsDataset,
      'setUser': setUser,
      'switchProject': switchProject,
      'uploadProject': uploadProject
    };

    /**
     * Private Functions
     */

    // Load all project properties from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().projectDb.iterate(function (value, key) {
        if (key === 'active_datasets') activeDatasets = value;
        else if (key === 'spots_dataset') spotsDataset = value;
        else if (key.startsWith('dataset_')) currentDatasets.push(value);
        else if (key.startsWith('spots_')) spotIds[key.split('_')[1]] = value;
        else currentProject[key] = value;
      }).then(function () {
        $log.log('Finished loading current project:', currentProject);
        $log.log('Finished loading current datasets:', currentDatasets);
        $log.log('Finished loading active datasets:', activeDatasets);
        $log.log('Finished loading spots dataset', spotsDataset);
        $log.log('Finished loading spots in datasets', spotIds);
        deferred.resolve();
      });
      return deferred.promise;
    }

    function createDefaultDataset() {
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var defaultDataset = {
        'name': 'Default',
        'date': new Date(),
        'id': id,
        'modified_timestamp': Date.now()
      };
      return defaultDataset;
    }

    function loadDatasetsRemote() {
      var deferred = $q.defer(); // init promise
      if (isSyncReady()) {
        $log.log('Loading remote datsets for this project...');
        RemoteServerFactory.getProjectDatasets(currentProject.id, user.encoded_login).then(function (response) {
          if (response.status === 200 && response.data && response.data.datasets) {
            $log.log('Loaded remote current datsets:', response);
            currentDatasets = response.data.datasets;
            saveDatasets().then(function () {
              deferred.resolve();
            });
          }
          else $log.log('Error communicating with server!');
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function saveDatasets() {
      var deferred = $q.defer(); // init promise
      if (currentDatasets.length === 0) currentDatasets.push(createDefaultDataset());
      var promises = [];
      _.each(currentDatasets, function (dataset) {
        promises.push(saveProjectItem('dataset_' + dataset.id, dataset));
      });
      $q.all(promises).then(function () {
        $log.log('Saved datasets:', currentDatasets);
        deferred.resolve();
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function addSpotToDataset(spotId, datasetId) {
      if (!spotIds[datasetId]) spotIds[datasetId] = [];
      if (!_.contains(spotIds[datasetId], spotId)) {
        spotIds[datasetId].push(spotId);
        saveProjectItem('spots_' + datasetId, spotIds[datasetId]).then(function () {
          $log.log('Added spot to dataset ' + datasetId + ': ' + spotIds[datasetId]);
        });
      }
    }

    function createNewDataset(datasetName) {
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var newDataset = {
        'name': datasetName,
        'date': new Date(),
        'modified_timestamp': Date.now(),
        'id': id
      };
      currentDatasets.push(newDataset);
      saveDatasets();
    }

    function createNewProject(descriptionData) {
      var deferred = $q.defer(); // init promise
      if (!descriptionData.start_date) delete descriptionData.start_date;
      if (!descriptionData.end_date) delete descriptionData.end_date;
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var promises = [];
      promises.push(saveProjectItem('description', descriptionData));
      promises.push(saveProjectItem('date', new Date()));
      promises.push(saveProjectItem('modified_timestamp', Date.now()));
      promises.push(saveProjectItem('id', id));
      promises.push(saveProjectItem('other_features', defaultTypes));
      $q.all(promises).then(function () {
        $log.log('New project:', currentProject);
        saveDatasets().then(function () {
          saveSpotsDataset(currentDatasets[0]);
          saveActiveDatasets([currentDatasets[0]]);
          deferred.resolve();
        });
      });
      return deferred.promise;
    }

    function destroyDataset(dataset) {
      var deferred = $q.defer(); // init promise
      var promises = [];
      promises.push(saveProjectItem('spots_' + dataset.id, undefined));
      promises.push(saveProjectItem('dataset_' + dataset.id, undefined));
      activeDatasets = _.reject(activeDatasets, function (activeDataset) {
        return activeDataset.id === dataset.id;
      });
      // Don't call saveProjectItem for next line since we don't want to update the modified_timestamp
      promises.push(LocalStorageFactory.getDb().projectDb.setItem('active_datasets', activeDatasets));
      currentDatasets = _.reject(currentDatasets, function (currentDataset) {
        return currentDataset.id === dataset.id;
      });
      if (dataset.id === spotsDataset.id) spotsDataset = {};
      promises.push(saveDatasets());

      $q.all(promises).then(function () {
        var spotsToDestroy = spotIds[dataset.id];
        delete spotIds[dataset.id];
        deferred.resolve(spotsToDestroy);
      });
      return deferred.promise;
    }

    function destroyProject() {
      var deferred = $q.defer(); // init promise
      currentDatasets = [];
      currentProject = {};
      activeDatasets = [];
      spotsDataset = {};
      spotIds = {};

      LocalStorageFactory.getDb().projectDb.clear().then(function () {
        $log.log('Current project deleted from local storage.');
        deferred.resolve();
      });
      return deferred.promise;
    }

    function destroyOtherFeature(i) {
      currentProject.other_features.splice(i, 1);
      saveProjectItem('other_features', currentProject.other_features);
    }

    function destroyRockUnit(key, value) {
      currentProject.rock_units = _.reject(currentProject.rock_units, function (obj) {
        return obj[key] === value;
      });
      if (_.isEmpty(currentProject.rock_units)) currentProject.rock_units = undefined;
      saveProjectItem('rock_units', currentProject.rock_units);
    }

    function getSpotsDataset() {
      return spotsDataset;
    }

    function getCurrentDatasets() {
      return currentDatasets;
    }

    function getCurrentProject() {
      return currentProject || {};
    }

    function getActiveDatasets() {
      return activeDatasets;
    }

    function getDefaultOtherFeatureTypes() {
      return defaultTypes;
    }

    function getOtherFeatures() {
      if (!currentProject) return undefined;
      return currentProject.other_features ? currentProject.other_features : [];
    }

    function getPreferences() {
      if (!currentProject) return undefined;
      return currentProject.preferences || {};
    }

    function getProjectDescription() {
      if (!currentProject) return undefined;
      return currentProject.description || {};
    }

    function getProjectName() {
      if (!currentProject) return undefined;
      return currentProject.description ? currentProject.description.project_name : undefined;
    }

    function getProjectTools() {
      if (!currentProject) return undefined;
      return currentProject.tools || {};
    }

    function getRockUnits() {
      if (!currentProject) return undefined;
      return currentProject.rock_units ? currentProject.rock_units : [];
    }

    function getSpotIds() {
      return spotIds;
    }

    function getSpotNumber() {
      return currentProject.preferences.starting_number_for_spot;
    }

    function getSamplePrefix() {
      return currentProject.preferences.sample_prefix;
    }

    function getSpotPrefix() {
      return currentProject.preferences.spot_prefix;
    }

    // Increment starting spot number by 1
    function incrementSpotNumber() {
      var start_number = getSpotNumber();
      if (start_number) {
        start_number += 1;
        currentProject.preferences.starting_number_for_spot = start_number;
        saveProjectItem('preferences', currentProject.preferences);
      }
    }

    function isSyncReady() {
      return !_.isEmpty(user) && navigator.onLine;
    }

    function loadProjectRemote(project) {
      var deferred = $q.defer(); // init promise
      if (isSyncReady()) {
        RemoteServerFactory.getProject(project.id, user.encoded_login).then(function (response) {
          $log.log('Loaded project', response);
          var remoteProject = response.data;
          var promises = [];
          if (!remoteProject.description) remoteProject.description = {};
          if (!remoteProject.description.project_name) remoteProject.description.project_name = 'Unnamed';
          if (!remoteProject.other_features) remoteProject.other_features = defaultTypes;
          promises.push(saveProjectItem('description', remoteProject.description));
          promises.push(saveProjectItem('date', remoteProject.date));
          promises.push(
            saveProjectItem('modified_timestamp', remoteProject.date.modified_timestamp || remoteProject.date));
          promises.push(saveProjectItem('id', remoteProject.id));
          promises.push(saveProjectItem('other_features', remoteProject.other_features));
          if (remoteProject.rock_units) promises.push(saveProjectItem('rock_units', remoteProject.rock_units));
          if (remoteProject.preferences) promises.push(saveProjectItem('preferences', remoteProject.preferences));
          if (remoteProject.daily_setup) promises.push(saveProjectItem('daily_setup', remoteProject.daily_setup));
          if (remoteProject.tools) promises.push(saveProjectItem('tools', remoteProject.tools));
          $q.all(promises).then(function () {
            loadDatasetsRemote().then(function () {
              deferred.resolve();
            });
          });
        }, function (response) {
          $log.log('Error downloading project', project, '. Response:', response);
          deferred.reject(response.data.Error);
        });
      }
      else deferred.reject();
      return deferred.promise;
    }

    function loadProjectsRemote() {
      var deferred = $q.defer(); // init promise
      if (!_.isEmpty(user) && navigator.onLine) {
        $log.log('Loading list of projects from server...');
        RemoteServerFactory.getMyProjects(user.encoded_login).then(function (response) {
          var remoteProjects = [];
          if (response.status === 200 && response.data.projects) {
            $log.log('Loaded list of all projects from server:', response);
            remoteProjects = response.data.projects;
          }
          else $log.log('Error communicating with server!');
          deferred.resolve(remoteProjects);
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function prepProject() {
      var deferred = $q.defer(); // init promise
      spotsDataset = {};
      currentProject = {};
      currentDatasets = [];
      activeDatasets = [];

      $log.log('Loading current project ....');
      all().then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeSpotFromDataset(spotId) {
      var deferred = $q.defer(); // init promise
      _.each(spotIds, function (spotsInDataset, datasetId) {
        if (_.contains(spotsInDataset, spotId)) {
          spotIds[datasetId] = _.without(spotsInDataset, spotId);
          if (_.isEmpty(spotIds[datasetId])) spotIds[datasetId] = undefined;
          $log.log('Removed Spot id from dataset', datasetId, 'SpotIds:', spotIds);
          saveProjectItem('spots_' + datasetId, spotIds[datasetId]);
        }
      });
      return deferred.promise;
    }

    function saveActiveDatasets(newActiveDatasets) {
      activeDatasets = newActiveDatasets;
      LocalStorageFactory.getDb().projectDb.setItem('active_datasets', activeDatasets).then(function () {
        $log.log('Saved active datsets:', activeDatasets);
      });
    }

    function saveProjectItem(key, value) {
      var deferred = $q.defer(); // init promise
      var timestamp = Date.now();
      LocalStorageFactory.getDb().projectDb.setItem('modified_timestamp', timestamp).then(function () {
        currentProject.modified_timestamp = timestamp;
        if (value) {
          if (!key.startsWith('dataset_') && !key.startsWith('spots_')) currentProject[key] = value;
          LocalStorageFactory.getDb().projectDb.setItem(key, value).then(function () {
            $log.log('Saved', key, ':', value);
            deferred.resolve();
          });
        }
        else {
          delete currentProject[key];
          LocalStorageFactory.getDb().projectDb.removeItem(key, function () {
            $log.log('No', key, '- Removed from local storage');
            deferred.resolve();
          });
        }
      });
      return deferred.promise;
    }

    function saveSpotsDataset(dataset) {
      spotsDataset = dataset;
      LocalStorageFactory.getDb().projectDb.setItem('spots_dataset', spotsDataset).then(function () {
        $log.log('Saved spots dataset:', spotsDataset);
      });
    }

    function setUser(inUser) {
      user = inUser;
    }

    function uploadProject() {
      var deferred = $q.defer(); // init promise
      if (!_.isEmpty(user) && navigator.onLine) {
        $log.log('Sync Project');
        deferred.resolve(true);
      }
      else deferred.resolve(false);
      return deferred.promise;
    }
  }
}());
