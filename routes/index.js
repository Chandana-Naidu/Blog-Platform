const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//Registration Page Post Method Router
router.post('/register', userController.register);

//Login Page Post Method Router
router.post('/login',userController.postLogin);

//Post the Blog Method Router
router.post('/postblog',authenticate,userController.postblog);

//Read all blog posts Method Router
router.post('/blog',authenticate,userController.blog);

//Update the blog based on id
router.put('/updateblog/:id',authenticate,userController.updateblog);

//Delete the Blog based on id
router.delete('/deleteblog/:id',authenticate,userController.deleteblog);

//Filter the blog posts based on tags
router.post('/filterblogs',userController.filterblogs);

//Populate Sample Data
router.post('/populateData',authenticate,userController.populateData);

//Add Comments for a Post
router.post('/addComment/:blogId',authenticate,userController.addComment);

//Read Comments for a Post
router.post('/readComment/:blogId',authenticate,userController.readComment);

//Delete Comments for a Post
router.post('/deleteComment/:commentId',authenticate,userController.deleteComment);

//Authenticate function is to check whether the user is authenticated or not
function authenticate(req, res, next) {
    if (!req.session || !req.session.user) {
        req.session.message='User not Authenticated';
        return res.send(req.session.message);
    }
    next();
}

module.exports = router;