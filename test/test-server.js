

const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe('blog-posts', function() {
    before(function() {
      return runServer();
    });
  
    after(function() {
      return closeServer();
    });
  
    it('should list of blog posts on GET', function() {
      return chai
        .request(app)
        .get("/blog-posts")
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.be.at.least(1);
  
          const expectedKeys = ["id", "title", "content", "author", "publishDate"];
          res.body.forEach(function(item) {
            expect(item).to.be.a("object");
            expect(item).to.include.keys(expectedKeys);
          });
        });
    });
  
    it("should add a blog post on POST", function() {
      const newItem = { 
        title: "Interesting Article", 
        content: "This is a really interesting article written by will shaughnessy",
        author: "Will Shaughnessy",
        publishDate: "2019-01-28"
      };
      return chai
        .request(app)
        .post("/blog-posts")
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys("id", "title", "content", "author", "publishDate");
          expect(res.body.id).to.not.equal(null);
          expect(res.body).to.deep.equal(
            Object.assign(newItem, { id: res.body.id })
          );
        });
    });
  
    it("should update blog post on PUT", function() {
      const updateData = {
        title: "Will is Cool",
        content: "Will is Cool",
        author: "will",
        publishDate: "2019-01-29"
      };
  
      return (
        chai
          .request(app)
          .get("/blog-posts")
          .then(function(res) {
            updateData.id = res.body[0].id;
            return chai
              .request(app)
              .put(`/blog-posts/${updateData.id}`)
              .send(updateData);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
          })
          .get("/blog-posts")
          .then(function(res) {
            expect(res.body[0].title === updateData.title);
            expect(res.body[0].content === updateData.content);
            expect(res.body[0].author === updateData.author);
            expect(res.body[0].publishDate === updateData.publishDate);
          })
      );
    });
  
    it("should delete items on DELETE", function() {
      return (
        chai
          .request(app)
          .get("/blog-posts")
          .then(function(res) {
            return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
          })
      );
    });
});