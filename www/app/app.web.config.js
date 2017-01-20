(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($urlRouterProvider, $stateProvider) {
    // Set up states
    $stateProvider
    /* .state('login', {
     'cache': false,
     'url': '/login',
     'templateUrl': 'app/user/login.html',
     'controller': 'LoginController as vm',
     'resolve': {
     'prepLogin': prepLogin
     }
     })*/
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.web.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepMenu': prepMenu
        }
      })
      .state('app.dashboard', {
        'cache': false,
        'url': '/dashboard',
        'views': {
          'menuContent': {
            'templateUrl': 'app/dashboard/dashboard.web.html',
            'controller': 'DashboardController'
          }
        }
      })
      .state('app.description', {
        'cache': false,
        'url': '/description',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/description.web.html',
            'controller': 'DescriptionController as vm'
          }
        }
      })
      .state('app.manage-project', {
        'cache': false,
        'url': '/manage-project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/manage-project.web.html',
            'controller': 'ManageProjectController as vm'
          }
        }
      })
      .state('app.relationships', {
        'cache': false,
        'url': '/relationships',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/relationships.web.html',
            'controller': 'RelationshipsController as vm'
          }
        }
      })
      .state('app.relationships.relationship', {
        'cache': false,
        'url': '/:relationship_id',
        'views': {
          'relationship-view@app.relationships': {
            'templateUrl': 'app/tag-relationship/relationship.web.html',
            'controller': 'RelationshipController as vm'
          }
        }
      })
      .state('app.tags', {
        'cache': false,
        'url': '/tags',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag-relationship/tags.web.html',
            'controller': 'TagsController as vm'
          }
        }
      })
      .state('app.tags.tag', {
        'cache': false,
        'url': '/:tag_id',
        'views': {
          'tag-view@app.tags': {
            'templateUrl': 'app/tag-relationship/tag.web.html',
            'controller': 'TagController as vm'
          }
        }
      })
      .state('app.tools', {
        'cache': false,
        'url': '/tools',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/tools.web.html',
            'controller': 'ToolsController as vm'
          }
        }
      })
      .state('app.user', {
        'cache': false,
        'url': '/user',
        'views': {
          'menuContent': {
            'templateUrl': 'app/user/user.web.html',
            'controller': 'UserController as vm'
          }
        }
      })
      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/map.web.html',
            'controller': 'MapController as vm'
          }
        }
      })/*
       .state('app.offlinemap', {
       'cache': false,
       'url': '/offlinemap',
       'views': {
       'menuContent': {
       'templateUrl': 'app/map/offline-map.html',
       'controller': 'OfflineMapController as vm'
       }
       }
       })*/
      .state('app.other-maps', {
        'cache': false,
        'url': '/other-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/other-maps.web.html',
            'controller': 'OtherMapsController as vm'
          }
        }
      })
      .state('app.preferences', {
        'cache': false,
        'url': '/preferences',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/preferences.web.html',
            'controller': 'PreferencesController as vm'
          }
        }
      })
      .state('app.image-basemaps', {
        'cache': false,
        'url': '/image-basemaps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/image-basemaps.web.html',
            'controller': 'ImageBasemapsController as vm'
          }
        }
      })
      .state('app.image-basemaps.image-basemap', {
        'cache': false,
        'url': '/:imagebasemapId',
        'views': {
          'image-basemap-view': {
            'templateUrl': 'app/map/image-basemap.web.html',
            'controller': 'ImageBasemapController as vm'
          }
        }
      })/*
       .state('app.spots', {
       'cache': false,
       'url': '/spots',
       'views': {
       'menuContent': {
       'templateUrl': 'app/spot/spots.html',
       'controller': 'SpotsController as vm'
       }
       }
       })*/
      .state('app.spotTab', {
        'cache': false,
        'url': '/spotTab',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/spots.web.html',
            'controller': 'SpotsController as vm'
          },
          'spot-data@app.spotTab': {
            'templateUrl': 'app/spot/spot.web.html',
            'controller': 'SpotController as vm'
          }
        },
        'onExit': function ($log, SpotFactory) {
          $log.log('Exiting Spots State. Clearing current Spot ...');
          SpotFactory.clearCurrentSpot();
        }
      })
      .state('app.spotTab.orientation-data', {
        'cache': false,
        'url': '/:spotId/orientation-data',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientation-data-tab.web.html',
            'controller': 'OrientationDataTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images-tab.web.html',
            'controller': 'ImagesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.inferences', {
        'cache': false,
        'url': '/:spotId/inferences',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/inferences-tab.web.html',
            'controller': 'InferencesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.nest', {
        'cache': false,
        'url': '/:spotId/nest',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/nest-tab.web.html',
            'controller': 'NestTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.other-features', {
        'cache': false,
        'url': '/:spotId/other-features',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/other-features-tab.web.html',
            'controller': 'OtherFeaturesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.spot', {
        'cache': false,
        'url': '/:spotId/spot',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/spot-tab.web.html',
            'controller': 'SpotTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.samples', {
        'cache': false,
        'url': '/:spotId/samples',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/samples-tab.web.html',
            'controller': 'SamplesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab._3dstructures', {
        'cache': false,
        'url': '/:spotId/_3dstructures',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/3dstructures-tab.web.html',
            'controller': '_3DStructuresTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.tags', {
        'cache': false,
        'url': '/:spotId/tags',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/tags-tab.web.html',
            'controller': 'TagsTabController as vmChild'
          }
        }
      })
      .state('app.archiveTiles', {
        'url': '/map/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'app/map/archive-tiles.html',
            'controller': 'ArchiveTilesController as vm'
          }
        }
      })
      .state('app.debug', {
        'cache': false,
        'url': '/debug',
        'views': {
          'menuContent': {
            'templateUrl': 'app/debug/misc.web.html',
            'controller': 'DebugController as vm'
          }
        }
      })
      .state('app.about', {
        'cache': false,
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'app/about/about.web.html'/*,
             'controller': 'AboutController as vm'*/
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/map');
  }

  /*
   function prepLogin(LocalStorageFactory, UserFactory) {
   return LocalStorageFactory.setupLocalforage().then(function () {
   return UserFactory.loadUser();
   });
   }
   */
  function prepMenu($ionicLoading, LocalStorageFactory, DataModelsFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                    UserFactory, OtherMapsFactory) {
    $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loading Data Models...'});
    return DataModelsFactory.loadDataModels().then(function () {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loading Database...'});
      return LocalStorageFactory.setupLocalforage().then(function () {
        $ionicLoading.show(
          {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loading User...'});
        return UserFactory.loadUser().then(function () {
          $ionicLoading.show(
            {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loading Project...'});
          return ProjectFactory.prepProject().then(function () {
            $ionicLoading.show(
              {'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loaded Project<br>Loading Spots...'});
            return SpotFactory.loadSpots().then(function () {
              $ionicLoading.hide();
              return RemoteServerFactory.loadDbUrl().then(function () {
                return OtherMapsFactory.loadOtherMaps();
              });
            });
          });
        });
      });
    });
  }
}());
