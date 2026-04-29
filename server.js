const fastify = require('fastify')({ logger: true });
const path = require('path');
const db = require('./db');

// --- Плагины ---
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

fastify.register(require('@fastify/view'), {
  engine: { pug: require('pug') },
  root: path.join(__dirname, 'views'),
});

fastify.register(require('@fastify/formbody'));

// --- Маршруты ---

// Редирект с главной на /users
fastify.get('/', async (request, reply) => {
  return reply.redirect('/users');
});

// Список пользователей
fastify.get('/users', async (request, reply) => {
  const users = await db.getAllUsers();
  return reply.view('users.pug', { title: 'Пользователи', users });
});

// Форма создания
fastify.get('/users/create', async (request, reply) => {
  return reply.view('create.pug', { title: 'Создать пользователя' });
});

// Создать пользователя
fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body;
  await db.createUser(name, email);
  return reply.redirect('/users');
});

// Форма редактирования
fastify.get('/users/:id/edit', async (request, reply) => {
  const user = await db.getUserById(Number(request.params.id));
  if (!user) return reply.code(404).send('Пользователь не найден');
  return reply.view('edit.pug', { title: 'Редактировать пользователя', user });
});

// Обновить пользователя
fastify.post('/users/:id/edit', async (request, reply) => {
  const { name, email } = request.body;
  await db.updateUser(Number(request.params.id), name, email);
  return reply.redirect('/users');
});

// Удалить пользователя
fastify.post('/users/:id/delete', async (request, reply) => {
  await db.deleteUser(Number(request.params.id));
  return reply.redirect('/users');
});

// --- Запуск ---
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
