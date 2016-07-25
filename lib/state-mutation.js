'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setIsInvalidatingForExistingEntity = exports.updateOrInsertEntitiesIntoState = exports.removeEntityFromState = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var updateReverseRelationship = function updateReverseRelationship(entity, relationship) {
  var newRelation = arguments.length <= 2 || arguments[2] === undefined ? {
    type: entity.get('type'),
    id: entity.get('id')
  } : arguments[2];

  return function (foreignEntities) {
    return foreignEntities.update(foreignEntities.findIndex(function (item) {
      return item.get('id') === relationship.getIn(['data', 'id']);
    }), function (foreignEntity) {
      var _map = [1, 2].map(function (i) {
        return (0, _pluralize2.default)(entity.get('type'), i);
      });

      var _map2 = (0, _slicedToArray3.default)(_map, 2);

      var singular = _map2[0];
      var plural = _map2[1];

      var relCase = [singular, plural].find(function (r) {
        return foreignEntity.hasIn(['relationships', r]);
      });

      if (!relCase) {
        return foreignEntity;
      }

      return foreignEntity.updateIn(['relationships', relCase, 'data'], function (relation) {
        if (relCase === singular) {
          return newRelation;
        }

        if (!relation) {
          return [newRelation];
        }

        return relation.push(newRelation);
      });
    });
  };
};

var updateOrInsertEntity = function updateOrInsertEntity(state, entity) {
  if (_immutable2.default.Map.isMap(entity) === false) {
    return state;
  }

  return state.withMutations(function (s) {
    s.updateIn([entity.get('type'), 'data'], function () {
      var list = arguments.length <= 0 || arguments[0] === undefined ? new _immutable2.default.List() : arguments[0];

      return list.filter(function (e) {
        return e.get('id') !== entity.get('id');
      }).push(entity);
    });

    var rels = entity.get('relationships');

    if (!rels) {
      return;
    }

    rels.forEach(function (relationship) {
      var entityPath = [relationship.getIn(['data', 'type']), 'data'];

      if (s.hasIn(entityPath) === false) {
        return;
      }

      s.updateIn(entityPath, updateReverseRelationship(entity, relationship));
    });
  });
};

var removeEntityFromState = exports.removeEntityFromState = function removeEntityFromState(state, entity) {
  return state.withMutations(function (newState) {
    newState.updateIn([entity.get('type'), 'data'], function (curVal) {
      return curVal.filter(function (l) {
        return l.get('id') !== entity.get('id');
      });
    });

    entity.get('relationships').forEach(function (relationship) {
      var entityPath = [relationship.getIn(['data', 'type']), 'data'];

      if (newState.hasIn(entityPath) === false) {
        return;
      }

      newState.updateIn(entityPath, updateReverseRelationship(entity, relationship, null));
    });
  });
};

var updateOrInsertEntitiesIntoState = exports.updateOrInsertEntitiesIntoState = function updateOrInsertEntitiesIntoState(state, entities) {
  return entities.reduce(updateOrInsertEntity, state);
};

var setIsInvalidatingForExistingEntity = exports.setIsInvalidatingForExistingEntity = function setIsInvalidatingForExistingEntity(state, _ref, value) {
  var type = _ref.type;
  var id = _ref.id;

  return state.updateIn([type, 'data'], function (entities) {
    return entities.update(entities.findIndex(function (item) {
      return item.get('id') === id && item.get('type') === type;
    }), function (entity) {
      return value === null ? entity.delete('isInvalidating') : entity.set('isInvalidating', value);
    });
  });
};