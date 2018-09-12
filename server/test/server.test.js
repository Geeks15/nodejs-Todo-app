const expect = require ('expect');
const request = require ('supertest');
const {ObjectID} = require ('mongodb');

const {app} = require ('./../server');
const {Todo} = require ('./../db/model/todos');

// var todos = [{
//     text: 'Sample test Todo 1'
// },{
//     text: 'Sample test Todo 2'
// }];

// ================================== will Run before tests are called ==================

beforeEach((done) => {
    Todo.deleteMany({completedAt: null}).then(() => {
        return Todo.insertMany([{_id: ObjectID.createFromHexString('5b97e6a75887b1697ce4c6fe'),text:'Test Todo'}]);
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
                expect(todos.length).toBe(2);
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
                expect(todos.length).toBe(1);
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

            expect(res.body.length).toBe(1);

        })
        .end(done);
    });

});

describe('GET /todos/:id',()=>{

    it('should return todo',(done) => {

        request(app)
        .get('/todos/5b97e6a75887b1697ce4c6fe')
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe('5b97e6a75887b1697ce4c6fe');
        })
        .end(done);
    });

    it('should return 404 error for invalid ObjectID',(done) => {

        request(app)
        .get('/todos/5b97e6a75887b1697ce4c6fe4')
        .expect(404)
        .end(done);
    });

    it('should return 404 for a non-existing valid ObjectID',(done) => {

        request(app)
        .get('/todo/6b97e6a75887b1697ce4c6fe')
        .expect(404)
        .end(done);
    });
})