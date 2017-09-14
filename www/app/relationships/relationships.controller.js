(function () {
  'use strict';

  angular
    .module('app')
    .controller('RelationshipsController', RelationshipsController);

  RelationshipsController.$inject = ['$ionicPopover', '$ionicPopup', '$location', '$log', '$scope', '$state',
    'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'IS_WEB'];

  function RelationshipsController($ionicPopover, $ionicPopup, $location, $log, $scope, $state, HelpersFactory,
                                   LiveDBFactory, ProjectFactory, IS_WEB) {
    var vm = this;

    var isDelete = false;

    vm.relationships = [];
    vm.relationshipIdSelected = undefined;

    vm.deleteAllRelationships = deleteAllRelationships;
    vm.deleteRelationship = deleteRelationship;
    vm.goToRelationship = goToRelationship;
    vm.newRelationship = newRelationship;
    vm.updateRelationships = updateRelationships;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if ($state.params && $state.params.relationship_id) vm.relationshipIdSelected = $state.params.relationship_id;

      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.relationships = ProjectFactory.getRelationships();
        createPopover();
      }
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/relationships/relationships-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
    }

    /**
     * Public Functions
     */

    function deleteAllRelationships() {
      vm.popover.hide().then(function(){
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Delete Relationships',
          'template': 'Are you sure you want to delete <b>ALL</b> relationships?'
        });
        confirmPopup.then(
          function (res) {
            if (res) {
              ProjectFactory.destroyRelationships().then(function () {
                if (IS_WEB) {
                  vm.relationshipIdSelected = undefined;
                  $log.log('Delete relationships from LiveDB.', ProjectFactory.getCurrentProject());
                  LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
                  $location.path('app/relationships');
                }
                activate();
              });
            }
          }
        );
      });
    }

    function deleteRelationship(relationship) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Relationship',
        'template': 'Are you sure you want to delete Relationships ' + relationship.name + '?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          ProjectFactory.destroyRelationship(relationship.id).then(function () {
            if (IS_WEB) {
              vm.relationshipIdSelected = undefined;
              $log.log('Save relationships to LiveDB.', ProjectFactory.getCurrentProject());
              LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
              $location.path('app/relationships');
            }
            activate();
          });
        }
        isDelete = false;
      });
    }

    function goToRelationship(id) {
      vm.relationshipIdSelected = id;
      if (!isDelete) $location.path('/app/relationships/' + id);
    }

    function newRelationship() {
      var id = HelpersFactory.getNewId();
      vm.relationshipIdSelected = id;
      $location.path('/app/relationships/' + id);
    }

    function updateRelationships() {
      vm.relationships = ProjectFactory.getRelationships();
    }
  }
}());
