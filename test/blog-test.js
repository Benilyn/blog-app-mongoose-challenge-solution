const chai		=	require('chai');
const chaiHttp	=	require('chai-http');
const faker		=	require('faker');
const mongoose	=	require('mongoose');

const should 	=	chai.should();

const {BlogPost}	=	require('../models');
const {app, runServer, closeServer}	=	require('../server');
const {TEST_DATABASE_URL}	=	require('../config');

chai.use(chaiHttp);

function seedBlogPost() {
	console.info('seeding blog post');
	const seedPost = [];

	for (let i=1; i<=5; i++) {
		seedPost.push(generateBlogPost());
	} //for
	return BlogPost.insertMany(seedPost);
} //function seedBlogPost	

function generateBlogPost() {
	return {
		author: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName()
		},
		title: faker.lorem.words(5),
		content: faker.lorem.paragraph(),
		created: faker.date.past()
	} //return
} //function generateBlogPost

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
} //function tearDownDb

describe('BlogPost API resource', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	}); //before function

	beforeEach(function() {
		return seedBlogPost();
	}); //beforeEach function

	afterEach(function() {
		return tearDownDb();
	}); //afterEach function

	after(function() {
		return closeServer();
	}); //after function


	describe('GET endpoint', function() {
		it('should return all existing blog posts', function() {
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return BlogPost.count();
			}) //.then(function(_res))
			.then(function(count) {
				res.body.should.have.length.of(count);
			}); //.then(function(count))
		}); //it(should return all)

		it('should return blog posts with right fields', function() {
			let resBlogPost;
			return chai.request(app)
				.get('/posts')
				.then(function(res) {
					res.should.have.status(200);
					res.should.be.json;
					res.body.should.be.a('array');
					res.body.should.have.length.of.at.least(1);
					
					res.body.forEach(function(post) {
						post.should.be.a('object');
						post.should.include.keys(
							'id',
							'title',
							'content',
							'author',
							'created'
						); //post.should.include.keys 
					}); //res.body.posts.forEach(function)

					resBlogPost = res.body[0];
					return BlogPost.findById(resBlogPost.id);
				}) //.then (function(res))

				.then(function(post) {
					resBlogPost.id.should.equal(post.id);
					resBlogPost.title.should.equal(post.title);
					resBlogPost.content.should.equal(post.content);
					resBlogPost.author.should.contain(post.author.firstName, post.author.lastName);
				}); //.then (function(post))
		}); //it(should return with right fields)
	}); //describe('GET endpoint')
/*
	describe('POST endpoint', function() {
		it('should add a new blog post', function() {
			const newBlogPost = generateBlogPost();

			return chai.request(app)
			.post('/posts')
			.send(newBlogPost)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys(
					'id',
					'title',
					'content',
					'author',
					'created'
				) //res.body.should.include.keys
				
				res.body.title.should.equal(newBlogPost.title);
				res.body.id.should.not.be.null;
				res.body.created.should.not.be.null;
				res.body.content.should.equal(newBlogPost.content);
				res.body.author.should.contain(newBlogPost.author.firstName, newBlogPost.author.lastName);
				return BlogPost.findById(res.body.id);
			}) //.then(function(res))

			.then(function(post) {
				newBlogPost.id.should.equal(post.id);
				newBlogPost.title.should.equal(post.title);
				newBlogPost.content.should.equal(post.content);
				newBlogPost.author.should.contain(post.author.firstName, post.author.lastName);
				newBlogPost.created.should.equal(post.created);
			}); //.then(function(post))
		}); //it(should add a new blog post)
	}); //describe(POST endpoint)

	describe('PUT endpoint', function() {
		it('should update fields you send over', function() {
			const updatePost = {
				title: 'Testing update',
				content: 'The quick brown fox jumped over the lazy dog.',
				author: {
					firstName: 'Lily',
					lastName: 'Bud'
				},
			}; //const updatePost

			return BlogPost
				.findOne()
				.exec()
				.then(function(post) {
					updatePost.id = post.id;
					return chai.request(app)
					.put('/posts/${post.id}')
					.send(updatePost);
				})
				.then(function(res) {
					res.should.have.status(201);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.title.should.equal(updatePost.title);
					res.body.author.should.contain(updatePost.author,firstName, updatePost.author.lastName);
					res.body.content.should.equal(updatePost.content);
					return BlogPost.findById(updatePost.id).exec();
				})
				.then(function(post) {
					post.title.should.equal(updatePost.title);
					post.content.should.equal(updatePost.content);
					post.author.should.be.contain(updatePost.author.firstName, updatePost.author.lastName);
				}); //.then(function(post))
		}); //it(should update fields you send over)
	}); //describe (PUT endpoint)
*/
	describe('DELETE endpoint', function() {
		it('delete a blog post by id', function() {
			let post;
			return BlogPost
				.findOne()
				.exec()
				.then(function(_post) {
					post = _post;
					return chai.request(app).delete(`/posts/${post.id}`);
				}) //.then(function(_post))
				.then(function(res) {
					res.should.have.status(204);
					return BlogPost.findById(post.id).exec();
				}) //.then(function(res))
				.then(function(_post) {
					should.not.exist(_post);
				}); //.then(function(_post))
		}); //it(delete a blog post by id)
	}); //describe(DELETE endpoint)

}); //describe('BlogPost API resource')










