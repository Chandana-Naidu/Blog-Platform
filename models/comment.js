const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    commenterName: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Assuming your User model's name is 'User'
        required: true
    }, commentText: {
        type: String,
        required: true
    }, creationDate: {
        type: Date,
        default: Date.now
    }, blogPost: {
        type: Schema.Types.ObjectId,
        ref: 'BlogPost',  // Assuming your BlogPost model's name is 'BlogPost'
        required: true
    }
});
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
