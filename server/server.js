const express = require ('express');
const bodyParser = require ('body-parser');

const {mongoose} = require ('./db/mongoose');
const {User} = require ('./db/model/user');
const {Todo} = require ('./db/model/todos');



var app = express();
app.use(bodyParser.json());

app.post('/todos',(req,res) => {
    let todo = new Todo({text:req.body.text});
    todo.save().then((doc) => {
        console.log('To added!!');
        res.send(doc);
    },(err)=>{
        console.log('Not updated!!');
        res.status(400).send(err);
    });

});

app.listen(5001,()=>{
    console.log('Server starting at port 5001 !!')
})

module.exports = {app};

// let newUser = new User({email: 'amir.suhail@accenture.com'});
// newUser.save().then((doc)=>{console.log('User Added!!')},(err)=>{console.log(`User can't be added!!`)});
