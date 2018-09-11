const expect = require ('expect');
const request = require ('supertest');

const {app} = require ('./../server');
const {Todo} = require ('./../db/model/todos');

beforeEach((done) => {
    Todo.remove({}).then(() => done());
});

describe ('POST /todos', () => {

    it('should create a new todo', (done) => {

        var text = 'Test Todo';
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            console.log(res.body.text);
            expect(res.body.text).toBe(text);

        }).end((err,res) => {

            if(err)
                return done(err);

            Todo.find().then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });

    });

});