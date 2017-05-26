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
		}); //it

	}); //describe('GET endpoint')



}); //describe('BlogPost API resource')










