const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const Comment = require('../models/comment');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users });  // Render the 'users' view and pass the users data
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.index = (req, res) => {
    console.log("Inside /index route");
    res.render('index');
};

exports.register = async (req, res) => {
    try {
        console.log("Inside /register post route");
        if (req.body.password !== req.body.confirm_password){
            req.session.message = "Passwords Not Matched!";
            console.log("Passwords Not Matched! Error");
            return res.send(req.session.message);
        }else{
            console.log(req.body.password);
            console.log("Inside Else Statement");
            const { username, email, password } = req.body;
            // Check for duplicate username or email
            const existingUserByUsername = await User.findOne({ username: username });
            const existingUserByEmail = await User.findOne({ email: email });
            console.log(existingUserByUsername);
            console.log(existingUserByEmail);
            if (existingUserByUsername) {
                console.log("Username already taken! Error");
                req.session.message = "Username already taken!";
                return res.send(req.session.message);
            }
            if (existingUserByEmail) {
                console.log("Email already registered!");
                req.session.message = "Email already registered!";
                return res.send(req.session.message);
            }
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                registerdate: new Date() // Current date and time
            });
            await newUser.save();

            req.session.message = "User Registration successful!";
            return res.send(req.session.message);
        }
    }catch(error){
        console.log(req.body.password);
        return res.status(400).send({ error: error.message });
    }
};


exports.postLogin = async (req, res) => {
    console.log("Inside /login post route");
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            req.session.message = 'User Not Found!';
            console.log("User Not Found!");
            return res.send(req.session.message);
        } else {
            const isPasswordValid =  bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log("Incorrect Password!");
                req.session.message = 'Incorrect Password!';
                return res.send(req.session.message);
            } else {
                req.session.user = user;
                req.session.message = 'Authentication Successful';
                return res.send(req.session.message);
            }
        }
    } catch (err) {
        console.log("Error:", err);
        return res.status(400).send({ error: error.message });
    }

};

exports.postblog = async (req, res) => {
    console.log("Inside /postblog post route");
    try {
        const { title, content, tags } = req.body;
        const blogPost = new BlogPost({ 
          title, 
          content, 
          author: req.session.user,
          tags 
        });
        await blogPost.save();
        //res.status(201).send("Blog Post Posted");
        console.log("Blog Post Posted")
        res.status(201).send(blogPost);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.blog = async (req, res) => {
    try {
        const blogs = await BlogPost.find().populate('author', 'username email -_id');
        res.status(200).send(blogs);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updateblog = async (req, res) => {
    console.log("Inside /updateblog put route");
    try {
        const { title, content, tags } = req.body;
        let blog = await BlogPost.findById(req.params.id);

    if (!blog) {
      return res.status(404).send({ error: 'Blog post not found' });
    }
    // Ensure that only the author can update the post
    if (blog.author.toString() !== req.session.user._id) {
      return res.status(403).send({ error: 'You are not authorized to update this post' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;
    
    await blog.save();

    res.status(200).send(blog);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.deleteblog = async (req, res) => {
    console.log("Inside /deleteblog delete Route");
    try{
        let blog = await BlogPost.findById(req.params.id);

        if (!blog) {
          return res.status(404).send({ error: 'Blog post not found' });
        }

        // Ensure that only the author can delete the post
        if (blog.author.toString() !== req.session.user._id) {
          return res.status(403).send({ error: 'You are not authorized to delete this post' });
        }

        await BlogPost.deleteOne({_id: req.params.id});
        res.status(200).send({ message: 'Blog post deleted successfully' });
    }catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.filterblogs = async (req, res) => {
    console.log("Inside /filterblogs push Route");
    let query = {};
    console.log(req.query.tags);
    if(req.query.tags){
        const tags = req.query.tags.split(',').map(tag => new RegExp('.*' + tag.trim() + '.*', 'i'));
        query.tags = { $elemMatch: { $in: tags } };
        console.log(query.tags);
    }
    try {
        const blogs = await BlogPost.find(query).exec();
        console.log(blogs);
        res.status(200).send(blogs);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching blogs', error });
    }
};

exports.addComment = async (req, res) => {
    console.log("Inside /addComment push Route");
    try{
        let blog = await BlogPost.findById(req.params.blogId);

        if (!blog) {
          return res.status(404).send({ error: 'Blog post not found' });
        }

        const blogId = req.params.blogId;
        const comment = new Comment({
            commentText: req.body.content,
            commenterName: req.session.user, // Assuming you have some authentication middleware setting this
            blogPost: blogId
        });
        await comment.save();
        res.status(200).send({ message: 'Comment on Blog post Added successfully' });
    }catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.readComment = async (req, res) => {
    console.log("Inside /readComment push Route");
    try {
        const comments = await Comment.find({ blogPost: req.params.blogId }).populate('commenterName', 'username email -_id');
        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    console.log('Inside /deleteComment push Route');
    try{
        let comment = await Comment.findById(req.params.commentId);

        if (!comment) {
          return res.status(404).send({ error: 'Comment post not found' });
        }

        // Ensure that only the author can delete the post
        if (comment.commenterName.toString() !== req.session.user._id) {
          return res.status(403).send({ error: 'You are not authorized to delete this Comment' });
        }

        await Comment.deleteOne({_id: req.params.commentId});
        res.status(200).send({ message: 'Comment deleted successfully' });
    }catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.populateData = async (req, res) => {
    console.log("Inside /populateData push Route");
    const saltRounds = 10;
    const user = new User({
        username: 'sampleUser',
        email: 'user0@email.com',
        password: await bcrypt.hash('samplePassword', saltRounds),
        registerdate: new Date()
    });
    await user.save();

    const user1 = new User({
        username: 'sample1',
        email: 'user1@email.com',
        password: await bcrypt.hash('samplePassword1', saltRounds),
        registerdate: new Date()
    });
    await user1.save();    

    const user2 = new User({
        username: 'sample2',
        email: 'user2@email.com',
        password: await bcrypt.hash('samplePassword2', saltRounds),
        registerdate: new Date()
    });
    await user2.save();    

    const user3 = new User({
        username: 'sample3',
        email: 'user3@email.com',
        password: await bcrypt.hash('samplePassword3', saltRounds),
        registerdate: new Date()
    });
    await user3.save();    

    const user4 = new User({
        username: 'sample4',
        email: 'user4@email.com',
        password: await bcrypt.hash('samplePassword4', saltRounds),
        registerdate: new Date()
    });
    await user4.save();

    const blogPost = new BlogPost({
        title: 'Sample 1 Blog Post',
        content: 'First post',
        author: user._id,
        creationDate: new Date(),
        tags: ['sample', 'test']
    });
    await blogPost.save();

    const blogPost1 = new BlogPost({
        title: 'Sample 2 Blog Post',
        content: 'Second post',
        author: user1._id,
        creationDate: new Date(),
        tags: ['sample', 'test']
    });
    await blogPost1.save();

    const blogPost2 = new BlogPost({
        title: 'Sample 3 Blog Post',
        content: 'Third post',
        author: user2._id,
        creationDate: new Date(),
        tags: ['sample', 'test']
    });
    await blogPost2.save();

    const blogPost3 = new BlogPost({
        title: 'Sample 4 Blog Post',
        content: 'Fourth post',
        author: user3._id,
        creationDate: new Date(),
        tags: ['sample', 'test']
    });
    await blogPost3.save();

    const blogPost4 = new BlogPost({
        title: 'Sample 5 Blog Post',
        content: 'Fifth post',
        author: user4._id,
        creationDate: new Date(),
        tags: ['sample', 'test']
    });
    await blogPost4.save();

    const comment = new Comment({
        commenterName: 'John Doe',
        commentText: 'Good',
        blogPost: blogPost._id
    });
    await comment.save();

    const comment1 = new Comment({
        commenterName: 'Lee Min Ho',
        commentText: 'Great',
        blogPost: blogPost1._id
    });
    await comment1.save();

    const comment2 = new Comment({
        commenterName: 'Park Jimin',
        commentText: 'Awesome',
        blogPost: blogPost1._id
    });
    await comment2.save();

    const comment3 = new Comment({
        commenterName: 'Kim Namjoon',
        commentText: 'Nice',
        blogPost: blogPost1._id
    });
    await comment3.save();

    const comment4 = new Comment({
        commenterName: 'Park Hyung Sik',
        commentText: 'Very nice',
        blogPost: blogPost1._id
    });
    await comment4.save();

    res.status(200).send("Sample Data Populated");
};

