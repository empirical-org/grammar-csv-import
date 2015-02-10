var _ = require('underscore');
var hstore = require('hstore.js');
var yaml = require('js-yaml');
var yaml2 = require('yaml2');
module.exports = function(activities) {

  var flags = [{id:1, name: '{production}'}, {id:2, name: '{beta}'},
    {id:3, name: '{alpha}'}, {id:4, name:'{archived}'}
  ];

  function makeRules(s) {
    try {
      var rules = hstore.parse(s).rule_position;
      rules = yaml.load(rules);
      rules = yaml2.eval(rules);
      if (typeof(rules) === 'object') {
        var isOneElement = rules.length === 1 && typeof(rules[0]) !== 'object';
        var isNotPaired = _.flatten(rules).length === rules.length;
        if (isOneElement || isNotPaired) {
          return _.map(rules, function(r) {
            return {
              ruleId: r,
              quantity: 1
            }
          });
        } else {
          return _.chain(rules)
            .flatten()
            .groupBy(function(e, index) {
              return Math.floor(index/2);
            })
            .toArray()
            .map(function(p) {
              return {
                ruleId: p[0],
                quantity: p[1]
              };
            })
            .value();
        }
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }


  var sentenceWritings = _.chain(_.groupBy(activities, 'activity_classification_id')[2])
    .map(function(n) {
      return {
        categoryId: n.topic_id,
        description: n.description,
        flags: n.flags,
        data: n.data,
        title: n.name.replace('Sentence Writing: ', ''),
      };
    })
    .map(function(f) {
      f.flagId = _.findWhere(flags, {name: f.flags}).id;
      delete(f.flags);
      return f;
    })
    .reject(function(f) {
      var archived = _.findWhere(flags, {name: '{archived}'}).id;
      return f.flagId === archived;
    })
    .map(function(d) {
      d.rules = _.extend({}, makeRules(d.data));
      delete(d.data);
      return d;
    })
    .value();
  require('build')(
    _.extend({}, sentenceWritings)
  );
}