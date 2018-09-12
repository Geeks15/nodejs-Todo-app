const express = require ('express');
const bodyParser = require ('body-parser');
const {ObjectID} = require ('mongodb');

const {mongoose} = require ('./db/mongoose');
const {User} = require ('./db/model/user');
const {Todo} = require ('./db/model/todos');


// ========================= Express Middleware ================================

var port = process.env.PORT || '5001'
var app = express();
app.use(bodyParser.json());

// ========================= API Routes ========================================

    // ===================== POST /todos =======================================

app.post('/todos',(req,res) => {
    let todo = new Todo({text:req.body.text});
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

// ========================= STARTING SERVER ON PORT 5001 =======================================

app.listen(port,()=>{
    console.log(`Server starting at port ${port} !!`)
})

module.exports = {app};

// let newUser = new User({email: 'amir.suhail@accenture.com'});
// newUser.save().then((doc)=>{console.log('User Added!!')},(err)=>{console.log(`User can't be added!!`)});
