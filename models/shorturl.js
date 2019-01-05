var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shorturlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true, unique: true}
});

module.exports = mongoose.model('shorturl', shorturlSchema);