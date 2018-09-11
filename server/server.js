const express = require ('express');
const bodyParser = require ('body-parser');

const {mongoose} = require ('./db/mongoose');
const {User} = require ('./db/model/user');
const {Todo} = require ('./db/model/todos');

// ========================= Express Middleware ================================

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

// ========================= STARTING SERVER ON PORT 5001 =======================================

app.listen(5001,()=>{
    console.log('Server starting at port 5001 !!')
})

module.exports = {app};

// let newUser = new User({email: 'amir.suhail@accenture.com'});
// newUser.save().then((doc)=>{console.log('User Added!!')},(err)=>{console.log(`User can't be added!!`)});
