function start(file, cb) {

  var Converter=require("csvtojson").core.Converter;
  var fs = require("fs");

  var fileStream=fs.createReadStream(file);
  var csvConverter=new Converter({constructResult:true});

  csvConverter.on("end_parsed",function(obj){
    cb(null, obj);
  });

  //read from file
  fileStream.pipe(csvConverter);
}

var async = require('async');

function nextStep(results) {
  require('./relate')(results[0], results[1]);
}

async.map(
  ['activities.csv', 'proofreading_hstore_data.csv'],
  start,
  function(err, results) {
    if (err) {
      throw err;
    }
    nextStep(results);
  }
);
