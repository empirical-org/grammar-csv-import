var _ = require('underscore');

var classifications = require('./../v1/cms/cms.json').classifications;

module.exports = function (rules, ruleQuestionsMap) {
  return _.chain(rules)
    .map(function (r) {
      var rqs = _.filter(ruleQuestionsMap, function(rq) {
        return Number(rq.ruleId) === Number(r.ruleNumber);
      });
      delete(r.ruleQuestions);
      r.questions = rqs;
      r.explanation = r.description;
      delete(r.description);
      r.standard_level = classifications[r.classification];
      delete(r.classification);
      r.standard = require('./findStandardForRule')(r);
      if (r.questions && r.questions.length > 0) {
        var rq = r.questions[0];
        r.concept_level_2 = rq.concept_level_2;
        r.concept_level_1 = rq.concept_level_1;
        r.concept_level_0 = rq.concept_level_0;
      }
      return r;
    })
    .value();
}
