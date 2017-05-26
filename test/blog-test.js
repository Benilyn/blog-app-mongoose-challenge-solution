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
					resBlogPost.author.should.equal(post.authorName);
				}); //.then (function(post))
		}); //it(should return with right fields)

	}); //describe('GET endpoint')



}); //describe('BlogPost API resource')









