const expect = require ('expect');
const request = require ('supertest');


const {app} = require ('./../server');
const {Todo} = require ('./../db/model/todos');
const {User}= require ('./../db/model/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');



// ================================== will Run before tests are called ==================

beforeEach(populateUsers);
beforeEach(populateTodos);


// ================================== POST /todos test cases =============================

describe ('POST /todos', () => {

    it('should create a new todo', (done) => {
        
        var text = 'Test Todo';
        request(app)
        .post('/todos')
        .set('x-auth',users[0].tokens[0].token)
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
        .set('x-auth',users[0].tokens[0].token)
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
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {

            expect(res.body.length).toBe(1);

        })
        .end(done);
    });

});

describe('GET /todos/:id',()=>{

    let hexId = todos[0]._id.toHexString();
    it('should return todo',(done) => {

        request(app)
        .get(`/todos/${hexId}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end(done);
    });

    it('should not return todo of other users',(done) => {

        request(app)
        .get(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 error for invalid ObjectID',(done) => {

        request(app)
        .get(`/todos/${hexId.replace('f','e')}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 for a non-existing valid ObjectID',(done) => {

        request(app)
        .get(`/todos/${hexId + '4'}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id',()=>{

    let hexId = todos[0]._id.toHexString();
    it('should delete todo',(done) => {

        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end(done);
    });


    it('should not delete todo of other user',(done) => {

        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });


    it('should return 404 error for invalid ObjectID',(done) => {

        request(app)
        .delete(`/todos/${hexId.replace('f','e')}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 for a non-existing valid ObjectID',(done) => {

        request(app)
        .delete(`/todos/${hexId + '6'}`)
        .set('x-auth',users[0].tokens[0].token)
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
        .set('x-auth',users[0].tokens[0].token)
        .send({completed : true,text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeTruthy();
        })
        .end(done);
    });

    it('should not update todo of other user',(done) => {

        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .send({completed : true,text})
        .expect(404)
        .end(done);
    });

    it('should update completedAt to null if completed is false',(done) => {

        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth',users[0].tokens[0].token)
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

    it('should return 401 error',(done) => {

        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    })

});


describe('POST /users',() => {

    let email = 'harshdeep.singh.gill@accenture.com';
    let password = 'userThreePassword';

    it('should insert user in database',(done) => {

        request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res) => {

            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body._id).toBeTruthy();
            expect(res.body.email).toBe(email);
        })
        .end(done);
    });

    it('should response with validation error or 400',(done) => {

        request(app)
        .post('/users')
        .send({email:'abc',password:'12df'})
        .expect(400)
        .end(done)
    });

    it('should response with validation error if email already exists',(done) => {

        request(app)
        .post('/users')
        .send({email:users[0].email,password})
        .expect(400)
        .end(done)
    });

});

describe('POST /users/login',()=>{

    let email = 'harshdeep.singh.gill@accenture.com';
    let password = 'userThreePassword';
    it('should return the user email and _id',(done) => {

        request(app)
        .post('/users/login')
        .send({email:users[0].email,password:users[0].password})
        .expect(200)
        .expect((res) => {

            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body.email).toBe(users[0].email);
            
        }).end((err,res) => {
            if(err)
                return done(err);
            User.findOne({email:users[0].email}).then((user) => {

                expect(user.tokens.length).toBe(2);
                done();
            }).catch((e) => done(e));
        })
        
    });

    it('should return 400 for an unregistered user',(done) => {

        request(app)
        .post('/users/login')
        .send({email,password:users[0].password})
        .expect(400)
        .end(done);
    })
    it('should return 400 for an wrong password',(done) => {

        request(app)
        .post('/users/login')
        .send({email:users[0].email,password})
        .expect(400)
        .end(done);
    })
})

describe('DELETE /users/me/token',() => {

    it('shoul remove the token on logout',(done) => {

        request(app)
        .delete('/users/me/token')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .end((err,res) => {
            if(err)
                return done(err);
            User.findOne({email:users[0].email}).then((user) => {

                expect(user.tokens.length).toBe(0);
                done();
            }).catch((err)=>done(err));
        })
    })
})
