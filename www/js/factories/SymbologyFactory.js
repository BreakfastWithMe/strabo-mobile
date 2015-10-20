'use strict';

angular
  .module('app')
  .factory('SymbologyFactory', function () {
    var symbols = {
      // Planar Symbols
      'axial_planar_inclined': 'img/geology/cleavage_inclined.png',
      'axial_planar_vertical': 'img/geology/cleavage_vertical.png',
      'bedding_horizontal': 'img/geology/bedding_horizontal.png',
      'bedding_inclined': 'img/geology/bedding_inclined.png',
      'bedding_vertical': 'img/geology/bedding_vertical.png',
      'contact_inclined': 'img/geology/contact_inclined.png',
      'contact_vertical': 'img/geology/contact_vertical.png',
      'fault_plane': 'img/geology/fault.png',
      'foliation_horizontal': 'img/geology/foliation_horizontal.png',
      'foliation_inclined': 'img/geology/foliation_general_inclined.png',
      'foliation_vertical': 'img/geology/foliation_general_vertical.png',
      'fracture': 'img/geology/fracture.png',
      'joint_inclined': 'img/geology/joint_surface_inclined.png',
      'joint_vertical': 'img/geology/joint_surface_vertical.png',
      'planar_general': 'img/geology/point.png',
      'shear_fracture': 'img/geology/shear_fracture.png',
      'shear_zone_inclined': 'img/geology/shear_zone_inclined.png',
      'shear_zone_vertical': 'img/geology/shear_zone_vertical.png',
      'vein': 'img/geology/vein.png',

      // Linear Symbols
      'fault': 'img/geology/fault_striation.png',
      'flow': 'img/geology/flow.png',
      'fold_hinge': 'img/geology/fold_axis.png',
      'intersection': 'img/geology/intersection.png',
      'lineation_general': 'img/geology/lineation_general.png',
      'solid_state': 'img/geology/solid_state.png',
      'vector': 'img/geology/vector.png'
    };

    var factory = {};
    factory.getSymbolPath = function (feature_type, pORl, orientation) {
      // Set a default symbol by whether feature is planar or linear
      var default_symbol = (pORl === 'planar') ? symbols.planar_general : symbols.lineation_general;

      switch (true) {
        case (orientation === 0):
          return symbols[feature_type + '_horizontal'] || symbols[feature_type + '_inclined'] || symbols[feature_type] || default_symbol;
        case ((orientation > 0) && (orientation < 90)):
          return symbols[feature_type + '_inclined'] || symbols[feature_type] || default_symbol;
        case (orientation === 90):
          return symbols[feature_type + '_vertical'] || symbols[feature_type] || default_symbol;
        default:
          return default_symbol;
      }
    };

    return factory;
  });
