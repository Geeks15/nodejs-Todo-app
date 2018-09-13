const expect = require ('expect');
const request = require ('supertest');
const {ObjectID} = require ('mongodb');

const {app} = require ('./../server');
const {Todo} = require ('./../db/model/todos');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');



// ================================== will Run before tests are called ==================

beforeEach(populateUsers);
beforeEach(populateTodos);


// ================================== POST /todos test cases =============================

describe ('POST /todos', () => {

    it('should create a new todo', (done) => {
        this.timeout(10000);
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

describe('GET /todos/:id',()=>{

    let hexId = todos[0]._id.toHexString();
    it('should return todo',(done) => {

        request(app)
        .get(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end(done);
    });

    it('should return 404 error for invalid ObjectID',(done) => {

        request(app)
        .get(`/todos/${hexId.replace('f','e')}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for a non-existing valid ObjectID',(done) => {

        request(app)
        .get(`/todos/${hexId + '4'}`)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id',()=>{

    let hexId = todos[0]._id.toHexString();
    it('should return todo',(done) => {

        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end(done);
    });

    it('should return 404 error for invalid ObjectID',(done) => {

        request(app)
        .delete(`/todos/${hexId.replace('f','e')}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for a non-existing valid ObjectID',(done) => {

        request(app)
        .delete(`/todos/${hexId + '6'}`)
        .expect(404)
        .end(done);
    });
    
});

describe('PATCH /todos/:id',() => {

    let text = 'Updated Todo 1'
    let hexId = todos[0]._id.toHexString();
    it('should update todo',(done) => {

        request(app)
        .patch(`/todos/${hexId}`)
        .send({completed : true,text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeTruthy();
        })
        .end(done);
    });

    it('should update completedAt to null if completed is false',(done) => {

        request(app)
        .patch(`/todos/${hexId}`)
        .send({completed : false,text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(null);

        })
        .end(done);
    });
});


describe('GET /users/me',() => {

    it('should return authenticated user',(done) => {

        request(app)
        .get('/users/me')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {

            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);

    });

});