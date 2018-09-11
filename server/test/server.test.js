const expect = require ('expect');
const request = require ('supertest');

const {app} = require ('./../server');
const {Todo} = require ('./../db/model/todos');

var todos = [{
    text: 'Sample test Todo 1'
},{
    text: 'Sample test Todo 2'
}];

// ================================== will Run before tests are called ==================

beforeEach((done) => {
    Todo.deleteMany({completedAt: null}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});


// ================================== POST /todos test cases =============================

describe ('POST /todos', () => {

    it('should create a new todo', (done) => {

        var text = 'Test Todo';
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {

            expect(res.body.text).toBe(text);

        }).end((err,res) => {

            if(err)
                return done(err);

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });

    });

    it('should not add invalid data',(done) => {

        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err,res) => {
            if(err)
                return done(err);

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });
    });

});

// ================================== GET /todos test cases =============================

describe('GET /todos', () => {

    it('should return all todos',(done) => {

        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {

            expect(res.body.length).toBe(2);

        })
        .end(done);
    });

});