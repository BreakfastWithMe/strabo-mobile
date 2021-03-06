(function () {
  'use strict';

  angular
    .module('app')
    .config(config);

  function config($ionicConfigProvider, $urlRouterProvider, $stateProvider) {
    // Align title text in nav bar in ion-view directive to left side
    $ionicConfigProvider.navBar.alignTitle('left');

    // Set up states
    $stateProvider
      .state('login', {
        'cache': false,
        'url': '/login',
        'templateUrl': 'app/login/login.html',
        'controller': 'LoginController as vm',
        'resolve': {
          'prepLogin': prepLogin
        }
      })
      .state('app', {
        'url': '/app',
        'abstract': true,
        'templateUrl': 'app/menu/menu.html',
        'controller': 'MenuController as vm',
        'resolve': {
          'prepMenu': prepMenu
        }
      })
      .state('app.description', {
        'cache': false,
        'url': '/description',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/description/description.html',
            'controller': 'DescriptionController as vm'
          }
        }
      })
      .state('app.images', {
        'cache': false,
        'url': '/images',
        'views': {
          'menuContent': {
            'templateUrl': 'app/attributes/images/images.html',
            'controller': 'ImagesController as vm'
          }
        }
      })
      .state('app.manage-project', {
        'cache': false,
        'url': '/manage-project',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/manage/manage-project.html',
            'controller': 'ManageProjectController as vm'
          }
        }
      })
      .state('app.relationships', {
        'cache': false,
        'url': '/relationships',
        'views': {
          'menuContent': {
            'templateUrl': 'app/relationships/relationships.html',
            'controller': 'RelationshipsController as vm'
          }
        }
      })
      .state('app.relationship', {
        'cache': false,
        'url': '/relationships/:relationship_id',
        'views': {
          'menuContent': {
            'templateUrl': 'app/relationship/relationship.html',
            'controller': 'RelationshipController as vm'
          }
        }
      })
      .state('app.samples', {
        'cache': false,
        'url': '/samples',
        'views': {
          'menuContent': {
            'templateUrl': 'app/attributes/samples/samples.html',
            'controller': 'SamplesController as vm'
          }
        }
      })
      .state('app.tags', {
        'cache': false,
        'url': '/tags',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tags/tags.html',
            'controller': 'TagsController as vm'
          }
        }
      })
      .state('app.tag', {
        'cache': false,
        'url': '/tags/:tag_id',
        'views': {
          'menuContent': {
            'templateUrl': 'app/tag/tag.html',
            'controller': 'TagController as vm'
          }
        }
      })
      .state('app.tools', {
        'cache': false,
        'url': '/tools',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/tools/tools.html',
            'controller': 'ToolsController as vm'
          }
        }
      })
      .state('app.user', {
        'cache': false,
        'url': '/user',
        'views': {
          'menuContent': {
            'templateUrl': 'app/user/user.html',
            'controller': 'UserController as vm'
          }
        }
      })
      .state('app.map', {
        'cache': false,
        'url': '/map',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/map/map.html',
            'controller': 'MapController as vm'
          }
        }
      })
      .state('app.offlinemap', {
        'cache': false,
        'url': '/offlinemap',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/offline-maps/offline-map.html',
            'controller': 'OfflineMapController as vm'
          }
        }
      })
      .state('app.other-maps', {
        'cache': false,
        'url': '/other-maps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/other-maps/other-maps.html',
            'controller': 'OtherMapsController as vm'
          }
        }
      })
      .state('app.preferences', {
        'cache': false,
        'url': '/preferences',
        'views': {
          'menuContent': {
            'templateUrl': 'app/project/preferences/preferences.html',
            'controller': 'PreferencesController as vm'
          }
        }
      })
      .state('app.image-basemaps', {
        'cache': false,
        'url': '/image-basemaps',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/image-basemaps/image-basemaps.html',
            'controller': 'ImageBasemapsController as vm'
          }
        }
      })
      .state('app.image-basemap', {
        'cache': false,
        'url': '/image-basemaps/:imagebasemapId',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/image-basemap/image-basemap.html',
            'controller': 'ImageBasemapController as vm'
          }
        }
      })
      .state('app.spots', {
        'cache': false,
        'url': '/spots',
        'views': {
          'menuContent': {
            'templateUrl': 'app/spots/spots.html',
            'controller': 'SpotsController as vm'
          }
        }
      })
      // setup an abstract state for the spot tabs directive
      .state('app.spotTab', {
        'url': '/spotTab',
        'abstract': true,
        'views': {
          'menuContent': {
            'templateUrl': 'app/spot/spot/spot.html',
            'controller': 'SpotController as vm'
          }
        }
      })
      .state('app.spotTab.orientations', {
        'cache': false,
        'url': '/:spotId/orientations',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/orientations/orientations-tab.html',
            'controller': 'OrientationsTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.images', {
        'cache': false,
        'url': '/:spotId/images',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/images/images-tab.html',
            'controller': 'ImagesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.relationships', {
        'cache': false,
        'url': '/:spotId/relationships',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/relationships/relationships-tab.html',
            'controller': 'RelationshipsTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.nesting', {
        'cache': false,
        'url': '/:spotId/nesting',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/nesting/nesting-tab.html',
            'controller': 'NestingTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.other-features', {
        'cache': false,
        'url': '/:spotId/other-features',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/other-features/other-features-tab.html',
            'controller': 'OtherFeaturesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.spot', {
        'cache': false,
        'url': '/:spotId/spot',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/spot-tab/spot-tab.html',
            'controller': 'SpotTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.samples', {
        'cache': false,
        'url': '/:spotId/samples',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/samples/samples-tab.html',
            'controller': 'SamplesTabController as vmChild'
          }
        }
      })
      .state('app.spotTab._3dstructures', {
        'cache': false,
        'url': '/:spotId/_3dstructures',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/3d-structures/3dstructures-tab.html',
            'controller': '_3DStructuresTabController as vmChild'
          }
        }
      })
      .state('app.spotTab.tags', {
        'cache': false,
        'url': '/:spotId/tags',
        'views': {
          'spottab-childview': {
            'templateUrl': 'app/spot/tags/tags-tab.html',
            'controller': 'TagsTabController as vmChild'
          }
        }
      })
      .state('app.archiveTiles', {
        'cache': false,
        'url': '/map/archiveTiles',
        'views': {
          'menuContent': {
            'templateUrl': 'app/maps/offline-maps/archive-tiles.html',
            'controller': 'ArchiveTilesController as vm'
          }
        }
      })
      .state('app.misc', {
        'cache': false,
        'url': '/misc',
        'views': {
          'menuContent': {
            'templateUrl': 'app/misc/misc.html',
            'controller': 'MiscController as vm'
          }
        }
      })
      .state('app.about', {
        'cache': false,
        'url': '/about',
        'views': {
          'menuContent': {
            'templateUrl': 'app/about/about.html',
            'controller': 'AboutController as vm'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  }

  function prepLogin(LocalStorageFactory, UserFactory) {
    return LocalStorageFactory.setupLocalforage().then(function () {
      return UserFactory.loadUser();
    });
  }

  function prepMenu($ionicLoading, LocalStorageFactory, DataModelsFactory, ProjectFactory, RemoteServerFactory, SpotFactory,
                    UserFactory, OtherMapsFactory) {
    $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loading Data Models...'});
    return DataModelsFactory.loadDataModels().then(function () {
      $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loading Database...'});
      return LocalStorageFactory.setupLocalforage().then(function () {
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loading User...'});
        return UserFactory.loadUser().then(function () {
          $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loading Project...'});
          return ProjectFactory.prepProject().then(function () {
            $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Loaded Data Models<br>Loaded Database<br>Loaded User<br>Loaded Project<br>Loading Spots...'});
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
