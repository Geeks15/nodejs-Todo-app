const {ObjectID} = require ('mongodb');
const {Todo} = require ('./../../db/model/todos')
const {User} = require ('./../../db/model/user');
const jwt = require ('jsonwebtoken');


let userOneId = new ObjectID();
let userTwoId = new ObjectID();
var users = [{
    _id: userOneId,
    email:'amir.suhail@accenture.com',
    password: 'userOnePassword',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id:userOneId.toHexString(),access:'auth'},'abc123').toString()
    }] 
},{
    _id:userTwoId,
    email:'dhruvi.makavana@accenture.com',
    password: 'userTwoPassword',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id:userTwoId.toHexString(),access:'auth'},'abc123').toString()
    }]
}]

let populateUsers = (done) => {
    User.remove({}).then(() => {

      let user1 = new User(users[0]).save();
      let user2 = new User(users[1]).save();

     return Promise.all([user1,user2])

    }).then(() => done());
   

}

var todos = [{
    _id: new ObjectID(),
    text: 'Sample test Todo',
    _creator: userOneId
},{
    _id: new ObjectID(),
    text: 'Sample test Todo',
    completed: true,
    completedAt: 333,
    _creator:userTwoId
}];

let populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
}

module.exports = {todos,populateTodos,users,populateUsers};