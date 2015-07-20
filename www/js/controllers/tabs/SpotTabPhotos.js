angular.module('app')
  .controller('SpotTabPhotosCtrl', function ($scope,
                                             $cordovaCamera,
                                             $ionicPopup,
                                             $ionicModal) {

    console.log('inside spot tab photos ctrl');

    $scope.showImages = function(index) {
      $scope.activeSlide = index;
      $ionicModal.fromTemplateUrl('templates/modals/imageModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.imageModal = modal;
        $scope.imageModal.show();
      });
    };

    $scope.closeImageModal = function() {
      $scope.imageModal.hide();
      $scope.imageModal.remove();
    };

    $scope.cameraSource = [{
      text: 'Photo Library',
      value: 'PHOTOLIBRARY'
    }, {
      text: 'Camera',
      value: 'CAMERA'
    }, {
      text: 'Saved Photo Album',
      value: 'SAVEDPHOTOALBUM'
    }];

    $scope.selectedCameraSource = {
      // default is always camera
      source: "CAMERA"
    };

    $scope.cameraModal = function(source) {
      // camera modal popup
      var myPopup = $ionicPopup.show({
        template: '<ion-radio ng-repeat="source in cameraSource" ng-value="source.value" ng-model="selectedCameraSource.source">{{ source.text }}</ion-radio>',
        title: 'Select an image source',
        scope: $scope,
        buttons: [{
          text: 'Cancel'
        }, {
          text: '<b>Go</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.selectedCameraSource.source) {
              //don't allow the user to close unless a value is set
              e.preventDefault();
            } else {
              return $scope.selectedCameraSource.source;
            }
          }
        }]
      });

      myPopup.then(function(cameraSource) {
        if (cameraSource) {
          launchCamera(cameraSource);
        }
      });
    };

    var launchCamera = function(source) {
      // all plugins must be wrapped in a ready function
      document.addEventListener("deviceready", function() {

        if (source == "PHOTOLIBRARY") {
          source = Camera.PictureSourceType.PHOTOLIBRARY;
        } else if (source == "CAMERA") {
          source = Camera.PictureSourceType.CAMERA;
        } else if (source == "SAVEDPHOTOALBUM") {
          source = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        }

        var cameraOptions = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: source,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          // popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: (source === Camera.PictureSourceType.CAMERA) ? true : false
        };

        $cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {

          /* the image has been written to the mobile device and the source is a camera type.
           * It is written in two places:
           *
           * Android:
           * 1) the local strabo-mobile cache, aka "/storage/emulated/0/Android/data/com.ionicframework.strabomobile327690/cache/filename.jpg"
           * 2) the Photo Album folder, on Android, this is: "/sdcard/Pictures/filename.jpg"
           *
           * iOS:
           * 1) in iOS, this is in the Photos Gallery???
           *
           *
           * If pulling from Photo Library:
           *
           * Android: file:///storage/emulated/0/DCIM/Camera/file.jpg
           * iOS: ???
           *
           */

          // create an images array if it doesn't exist -- camera images are stored here
          if ($scope.spot.images === undefined) {
            $scope.spot.images = [];
          }

          console.log('original imageURI ', imageURI);

          // are we on an android device and is the URI schema a "content://" type?
          if (imageURI.substring(0,10) === 'content://') {
            // yes, then convert it to a "file://" yet schemaless type
            window.FilePath.resolveNativePath(imageURI, resolveSuccess, resolveFail);
          } else {
            // no, so no conversion is needed
            resolveSuccess(imageURI);
          }

          function resolveFail(message) {
            console.log('failed to resolve URI', message);
          }

          // now we read the image from the filesystem and save the image to the spot
          function resolveSuccess(imageURI) {
            // is this a real file schema?
            if (imageURI.substring(0,7) !== 'file://') {
              // nope, then lets make this a real file schema
              imageURI = 'file://' + imageURI;
            }

            console.log('final imageURI ', imageURI);

            var gotFileEntry = function(fileEntry) {
              console.log("inside gotFileEntry");
              fileEntry.file(gotFile, resolveFail);
            };

            var gotFile = function(file) {
              console.log("inside gotFile");
              console.log('file is ', file);
              readDataUrl(file);
            };

            var readDataUrl = function(file) {
              // console.log("inside readDataUrl");
              var reader = new FileReader();
              reader.onloadend = function(evt) {
                // console.log("Read as data URL");
                // console.log(evt.target.result);
                var base64Image = evt.target.result;

                // push the image data to our camera images array
                $scope.$apply(function() {
                  $scope.spot.images.push({
                    src: base64Image
                  });
                });
              };

              reader.readAsDataURL(file);
            };

            // invoke the reading of the image file from the local filesystem
            window.resolveLocalFileSystemURL(imageURI, gotFileEntry, resolveFail);
          }

        }, function(err) {
          console.log("error: ", err);
        });
      });
    };

  });
