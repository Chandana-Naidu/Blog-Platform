const mongoose = require('mongoose');
const blogPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  creationDate: { 
    type: Date, 
    default: Date.now 
  }, tags: 
    [{ type: String }]
});
module.exports = mongoose.model('BlogPost', blogPostSchema);
