const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const existUser = users.find(user => user.username === username);

  if (!existUser) return response.status(404).json({ error: 'Usuario não existe' });

  request.user = {
    id: existUser.id,
    username: existUser.username
  };

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const existUser = users.find(user => user.username === username);

  if (existUser) return response.status(400).json({ error: 'Usuario com esse username ja exites' });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { id } = request.user;

  const user = users.find(user => user.id === id);

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body
  const { id } = request.user;

  const user = users.find(user => user.id === id);

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.user;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) return response.status(404).json({ error: 'Tarefa não existe' })
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.user;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) return response.status(404).json({ error: 'Tarefa não existe' })
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.user;

  const user = users.find(user => user.username === username);
  const todo = user.todos.findIndex(todo => todo.id === id);

  if (todo >= 0) {
    user.todos.splice(todo, 1);
  } else {
    return response.status(404).json({ error: 'Tarefa não existe' })
  }

  return response.status(204).send();
});

module.exports = app;