(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'LocalStorageFactory', 'OtherMapsFactory', 'RemoteServerFactory'];

  function ProjectFactory($log, $q, LocalStorageFactory, OtherMapsFactory, RemoteServerFactory) {
    var addNewActiveTag = false;
    var activeTags = [];
    var currentDatasets = [];
    var currentProject = {};
    var activeDatasets = [];
    var defaultTypes = ['geomorhic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];
    var isActiveTagging = false;
    var spotsDataset = {};
    var spotIds = {};
    var switchProject = false;
    var user = {};

    return {
      'addToActiveTags': addToActiveTags,
      'clearActiveTags': clearActiveTags,
      'addSpotToDataset': addSpotToDataset,
      'createNewDataset': createNewDataset,
      'createNewProject': createNewProject,
      'destroyDataset': destroyDataset,
      'destroyProject': destroyProject,
      'destroyOtherFeature': destroyOtherFeature,
      'destroyRockUnit': destroyRockUnit,
      'destroyTag': destroyTag,
      'destroyTags': destroyTags,
      'getActiveDatasets': getActiveDatasets,
      'getActiveTagging': getActiveTagging,
      'getAddNewActiveTag': getAddNewActiveTag,
      'getCurrentDatasets': getCurrentDatasets,
      'getCurrentProject': getCurrentProject,
      'getDefaultOtherFeatureTypes': getDefaultOtherFeatureTypes,
      'getPreferences': getPreferences,
      'getProjectName': getProjectName,
      'getProjectDescription': getProjectDescription,
      'getProjectTools': getProjectTools,
      'getOtherFeatures': getOtherFeatures,
      'getRockUnits': getRockUnits,
      'getSampleNumber': getSampleNumber,
      'getSamplePrefix': getSamplePrefix,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'getSpotsDataset': getSpotsDataset,
      'getSpotIds': getSpotIds,
      'getActiveTags': getActiveTags,
      'getNumTaggedFeatures': getNumTaggedFeatures,
      'getTag': getTag,
      'getTags': getTags,
      'getTagsBySpotId': getTagsBySpotId,
      'incrementSampleNumber': incrementSampleNumber,
      'incrementSpotNumber': incrementSpotNumber,
      'isSyncReady': isSyncReady,
      'loadProjectRemote': loadProjectRemote,
      'loadProjectsRemote': loadProjectsRemote,
      'prepProject': prepProject,                     // Run from app config
      'removeFeatureFromTags': removeFeatureFromTags,
      'removeSpotFromDataset': removeSpotFromDataset,
      'removeSpotFromTags':removeSpotFromTags,
      'removeTagFromFeature': removeTagFromFeature,
      'removeTagFromFeatures': removeTagFromFeatures,
      'removeTagFromSpot': removeTagFromSpot,
      'saveActiveDatasets': saveActiveDatasets,
      'saveProjectItem': saveProjectItem,
      'saveTag': saveTag,
      'saveSpotsDataset': saveSpotsDataset,
      'setActiveTagging': setActiveTagging,
      'setActiveTags': setActiveTags,
      'setAddNewActiveTag': setAddNewActiveTag,
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
          //$log.log('Added spot to dataset ' + datasetId + ': ' + spotIds[datasetId]);
        });
      }
    }

    function addToActiveTags(spotId) {
      _.each(activeTags, function (activeTag) {
        if (!_.contains(activeTag.spots, spotId)) {
          if (!activeTag.spots) activeTag.spots = [];
          activeTag.spots.push(spotId);
          saveTag(activeTag);
        }
      });
    }

    function clearActiveTags() {
      activeTags = [];
      $log.log('Cleared active tag:', activeTags);
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

    function destroyTag(id) {
      var deferred = $q.defer(); // init promise
      currentProject.tags = _.reject(currentProject.tags, function (tag) {
        return tag.id === id;
      });
      activeTags = _.reject(activeTags, function (activeTag) {
        return activeTag.id === id;
      });
      if (_.isEmpty(activeTags)) isActiveTagging = false;
      if (currentProject.tags.length === 0) destroyTags().then(deferred.resolve);
      else {
        saveProjectItem('tags', currentProject.tags).then(function () {
          deferred.resolve();
        });
      }
      return deferred.promise;
    }

    function destroyTags() {
      var deferred = $q.defer(); // init promise
      delete currentProject.tags;
      activeTags = [];
      isActiveTagging = false;
      LocalStorageFactory.getDb().projectDb.removeItem('tags').then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function getActiveTags() {
      return activeTags;
    }

    function getActiveTagging() {
      return isActiveTagging;
    }

    function getAddNewActiveTag() {
      return addNewActiveTag;
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

    function getSampleNumber() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.starting_sample_number;
    }

    function getSamplePrefix() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.sample_prefix;
    }

    function getSpotNumber() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.starting_number_for_spot;
    }

    function getSpotPrefix() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.spot_prefix;
    }

    function getTag(id) {
      if (!currentProject.tags) return {};
      return _.find(currentProject.tags,
          function (tag) {
            return tag.id === id;
          }) || {};
    }

    function getTags() {
      return currentProject.tags || [];
    }

    function getTagsBySpotId(spotId) {
      return _.filter(currentProject.tags, function (tag) {
        if (tag.spots && _.contains(tag.spots, spotId)) return true;
        else return (tag.features && tag.features[spotId]);
      });
    }

    function getNumTaggedFeatures(tag) {
      var count = 0;
      if (tag.features) {
        _.each(tag.features, function (featuresList) {
          count += featuresList.length;
        });
      }
      return count;
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

    // Increment starting sample number by 1
    function incrementSampleNumber() {
      var start_number = getSampleNumber();
      if (start_number) {
        start_number += 1;
        currentProject.preferences.starting_sample_number = start_number;
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
          if (remoteProject.tags) promises.push(saveProjectItem('tags', remoteProject.tags));
          if (remoteProject.tools) promises.push(saveProjectItem('tools', remoteProject.tools));
          if (remoteProject.other_maps) promises.push(OtherMapsFactory.addRemoteOtherMaps(remoteProject.other_maps));
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
      else deferred.reject('You must be online and logged in to load a remote project.');
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
          else {
            $log.log('Error loading list of all projects from server. Response:', response);
            deferred.reject('Error loading the list of projects from server!');
          }
          deferred.resolve(remoteProjects);
        }, function (response) {
          $log.log('Error loading list of all projects from server. Response:', response);
          deferred.reject('Error loading the list of projects from server!');
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

    function removeFeatureFromTags(spotId, featureId) {
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(currentProject.tags, function (tag) {
        if (tag.features && tag.features[spotId]) {
          tag.features[spotId] = _.without(tag.features[spotId], featureId);
          if (tag.features[spotId].length === 0) delete tag.features[spotId];
        }
        if (_.isEmpty(tag.features)) delete tag.features;
        promises.push(saveTag(tag));
      });
      $q.all(promises).then(function () {
        return deferred.promise;
      });
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

    function removeSpotFromTags(spotId) {
      var tags = getTagsBySpotId(spotId);
      _.each(tags, function (tag) {
        removeTagFromSpot(tag.id, spotId);
        if (tag.features && tag.features[spotId]) delete tag.features[spotId];
        if (_.isEmpty(tag.features)) delete tag.features;
        saveTag(tag);
      });
    }

    function removeTagFromFeature(tagId, spotId, featureId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      if (tag.features[spotId]) {
        tag.features[spotId] = _.without(tag.features[spotId], featureId);
        if (tag.features[spotId].length === 0) delete tag.features[spotId];
      }
      if (_.isEmpty(tag.features)) delete tag.features;
      saveTag(tag).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeTagFromFeatures(tagId, spotId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      delete tag.features[spotId];
      if (_.isEmpty(tag.features)) delete tag.features;
      saveTag(tag).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeTagFromSpot(tagId, spotId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      tag.spots = _.without(tag.spots, spotId);
      if (_.isEmpty(tag.spots)) delete tag.spots;
      saveTag(tag).then(function () {
        deferred.resolve();
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
            // $log.log('Saved', key, ':', value);
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

    function saveTag(tagToSave) {
      var deferred = $q.defer(); // init promise
      currentProject.tags = _.reject(currentProject.tags, function (tag) {
        return tag.id === tagToSave.id;
      });
      currentProject.tags.push(tagToSave);
      saveProjectItem('tags', currentProject.tags).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function saveSpotsDataset(dataset) {
      spotsDataset = dataset;
      LocalStorageFactory.getDb().projectDb.setItem('spots_dataset', spotsDataset).then(function () {
        $log.log('Saved spots dataset:', spotsDataset);
      });
    }

    function setActiveTags(inTag) {
      var found = _.find(activeTags, function (activeTag) {
        return activeTag.id === inTag.id;
      });
      if (!found) activeTags.push(inTag);
      else {
        activeTags = _.reject(activeTags, function (activeTag) {
          return activeTag.id === inTag.id;
        });
      }
      $log.log('Active Tags:', activeTags);
    }

    function setActiveTagging(inTagging) {
      isActiveTagging = inTagging;
    }

    function setAddNewActiveTag(inBool) {
      addNewActiveTag = inBool;
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
