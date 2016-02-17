(function () {
  'use strict';

  angular
    .module('app')
    .factory('DataModelsFactory', DataModelsFactory);

  DataModelsFactory.$inject = ['$log', '$http', '$q'];

  function DataModelsFactory($log, $http, $q) {
    var dataModels = {
      '_3d_structures': {
        'survey': {},
        'survey_file': 'app/data-models/3d_structures-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/3d_structures-choices.csv'
      },
      'image': {
        'survey': {},
        'survey_file': 'app/data-models/image_properties-survey.csv'
      },
      'orientation_data': {
        'linear_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/linear_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/linear_orientation-choices.csv'
        },
        'planar_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/planar_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/planar_orientation-choices.csv'
        },
        'tabular_orientation': {
          'survey': {},
          'survey_file': 'app/data-models/tabular_zone_orientation-survey.csv',
          'choices': {},
          'choices_file': 'app/data-models/tabular_zone_orientation-choices.csv'
        }
      },
      'preferences': {
        'survey': {},
        'survey_file': 'app/data-models/project_preferences-survey.csv'
      },
      'project': {
        'survey': {},
        'survey_file': 'app/data-models/project_description-survey.csv'
      },
      'rock_unit': {
        'survey': {},
        'survey_file': 'app/data-models/rock_unit-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/rock_unit-choices.csv'
      },
      'sample': {
        'survey': {},
        'survey_file': 'app/data-models/sample-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/sample-choices.csv'
      },
      'tools': {
        'survey': {},
        'survey_file': 'app/data-models/tools-survey.csv'
      },
      'traces': {
        'survey': {},
        'survey_file': 'app/data-models/traces-survey.csv',
        'choices': {},
        'choices_file': 'app/data-models/traces-choices.csv'
      }
    };
    var spotDataModel = {};

    return {
      'getDataModel': getDataModel,
      'getSpotDataModel': getSpotDataModel,
      'loadDataModels': loadDataModels,
      'readCSV': readCSV
    };

    /**
     * Private Functions
     */

    // Remove the default start and end objects
    function cleanJson(json) {
      return _.reject(json.data, function (obj) {
        return ((obj.name === 'start' && obj.type === 'start') || (obj.name === 'end' && obj.type === 'end'));
      });
    }

    function createSpotDataModel() {
      spotDataModel = {
        'geometry': {
          'coordinates': {},
          'type': 'one of [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon]'
        },
        'properties': {
          '_3d_structures': [],
          'date': 'datetime',
          'id': 'number; timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)',
          'modified_timestamp': 'timestamp',
          'name': 'Type: text; REQUIRED',
          'orientation_data': [],
          'rock_unit': {},
          'samples': [],
          'time': 'datetime',
          'trace': {}
        },
        'images': []
      };

      var models = {
        '_3d_structures': dataModels._3d_structures,
        'images': dataModels.image,
        'linear_orientation': dataModels.orientation_data.linear_orientation,
        'planar_orientation': dataModels.orientation_data.planar_orientation,
        'tabular_orientation': dataModels.orientation_data.tabular_orientation,
        'rock_unit': dataModels.rock_unit,
        'samples': dataModels.sample,
        'trace': dataModels.traces
      };
      _.each(models, function (model, key) {
        var description = {};
        _.each(model.survey, function (field) {
          if (field.type.split(' ')[0] !== 'end' && field.type.split(' ')[0] !== 'begin') {
            var type = getType(field.type, model);
            var hint = field.hint ? '; Hint: ' + field.hint : '';
            var required = field.required === 'true' ? '; REQUIRED' : '';
            description[field.name] = 'Type: ' + type + required + '; Label: ' + field.label + hint;
          }
        });
        description = sortby(description);
        if (key === 'linear_orientation' || key === 'planar_orientation' || key === 'tabular_orientation') {
          description.orientation_type = key + '; REQUIRED';
          description.associated_orientation = [];
          description = sortby(description);
          spotDataModel.properties.orientation_data.push(description);
        }
        else if (key === 'trace' || key === 'rock_unit') {
          _.extend(spotDataModel.properties[key], description);
        }
        else if (key === 'images') {
          description.annotated = 'true/false for whether or not the image is used as an Image Basemap';
          description = sortby(description);
          spotDataModel.images.push(description);
        }
        else spotDataModel.properties[key].push(description);
      });
    }

    function getType(type, model) {
      if (type.split(' ')[0] === 'select_one') {
        var choices = _.filter(model.choices, function (choice) {
          return choice['list name'] === type.split(' ')[1];
        });
        type = 'select one [' + _.pluck(choices, 'name').join(', ') + ']';
      }
      return type;
    }

    function loadDataModel(dataModel) {
      var deferred = $q.defer(); // init promise
      // Load the survey
      readCSV(dataModel.survey_file, function (surveyFields) {
        dataModel.survey = surveyFields;
        // Load the choices
        if (dataModel.choices_file) {
          readCSV(dataModel.choices_file, function (choicesFields) {
            dataModel.choices = choicesFields;
            deferred.resolve();
          });
        }
        else deferred.resolve();
      });
      return deferred.promise;
    }

    // Sort an arry of objects by key
    function sortby(obj, comparator) {
      var keys = _.sortBy(_.keys(obj), function (key) {
        return comparator ? comparator(obj[key], key) : key;
      });

      return _.object(keys, _.map(keys, function (key) {
        return obj[key];
      }));
    }

    /**
     * Public Functions
     */

    function getDataModel(model) {
      return dataModels[model];
    }

    function getSpotDataModel() {
      return spotDataModel;
    }

    function loadDataModels() {
      var deferred = $q.defer(); // init promise
      var promises = [];

      $log.log('Loading data models ...');
      _.each(dataModels, function (dataModel, key) {
        if (key === 'orientation_data') {
          _.each(dataModel, function (orientationDataModel, orientationKey) {
            // $log.log('Loading', key, orientationKey, ' ...');
            promises.push(loadDataModel(orientationDataModel));
          });
        }
        else {
          // $log.log('Loading', key, ' ...');
          promises.push(loadDataModel(dataModel));
        }
      });
      $q.all(promises).then(function () {
        $log.log('Finished loading all data models', dataModels);
        createSpotDataModel();
        deferred.resolve();
      });
      return deferred.promise;
    }

    function readCSV(csvFile, callback) {
      $http.get(
        csvFile, {
          'transformResponse': function (csv) {
            Papa.parse(csv, {
              'header': true,
              'skipEmptyLines': true,
              'complete': function (json) {
                // $log.log('Parsed csv: ', json);
                callback(cleanJson(json));
              }
            });
          }
        }
      );
    }
  }
}());
