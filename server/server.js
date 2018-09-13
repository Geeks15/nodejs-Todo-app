const express = require ('express');
const bodyParser = require ('body-parser');
const {ObjectID} = require ('mongodb');
const _ = require ('lodash');

const {mongoose} = require ('./db/mongoose');
const {User} = require ('./db/model/user');
const {Todo} = require ('./db/model/todos');
const {authenticate} = require('./middleware/express-middleware');


// ========================= Express Middleware ================================

var port = process.env.PORT || '5001'
var app = express();
app.use(bodyParser.json());

// ========================= API Routes ========================================

    // ===================== POST /todos =======================================

app.post('/todos',(req,res) => {
    let todo = new Todo(req.body);
    todo.save().then((doc) => {
        res.send(doc);
    },(err)=>{
        res.status(400).send(err);
    });

});

    // ===================== GET /todos =======================================

app.get('/todos',(req,res) => {

    Todo.find().then((todos) => {

        res.send(todos);

    },(err) => {

        res.status(400).send(err);
    })
})

    // ===================== GET /todos/:id =======================================

app.get('/todos/:id',(req,res) => {

    if(!ObjectID.isValid(req.params.id))
        return res.status(404).send();
    Todo.findById(req.params.id).then((todo) => {

        if(!todo)
            return res.status(404).send()

        res.send({todo});
    }).catch((e) => res.status(400).send());
})

    // ===================== DELETE /todos/:id =======================================

app.delete('/todos/:id',(req,res) => {

    if(!ObjectID.isValid(req.params.id))
        return res.status(404).send();

    Todo.findByIdAndRemove(req.params.id).then((todo) => {

        if(!todo)
            return res.status(404).send();
        res.send({todo});

    }).catch((err) => {res.status(400).send()});
})

    // ===================== PATCH /todos/:id =======================================

app.patch('/todos/:id',(req,res) => {


    let id = req.params.id;
    if(!ObjectID.isValid(id))
        return res.status(404).send();

    let body = _.pick(req.body,['text','completed']);

    if(typeof body.completed == 'boolean' && body.completed)
        body.completedAt = new Date().getTime();
    else{
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo) => {
       
        if(!todo)
            return res.status(404).send();
        res.send({todo});

    }).catch((err) => {res.status(400).send()});
})

    // ===================== POST /users =======================================

app.post('/users',(req,res) => {

    let body = _.pick(req.body,['email','password']);
    let user = new User(body);

    user.generateAuthToken().then((token) => {
        res.header('x-auth',token).send(user.toJSON());
    }).catch((err) => {res.status(400).send(err)});
    
});

    // ===================== GET /users/me =======================================

app.get('/users/me',authenticate,(req,res) => {

    res.send(req.user);

});

// ========================= STARTING SERVER ON PORT 5001 =======================================

app.listen(port,()=>{
    console.log(`Server starting at port ${port} !!`)
})

module.exports = {app};

// let newUser = new User({email: 'amir.suhail@accenture.com'});
// newUser.save().then((doc)=>{console.log('User Added!!')},(err)=>{console.log(`User can't be added!!`)});
