import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
    // add new list
    rest.post('/api/v1/lists', (req, res, ctx) => {
        const list = { id: 2, name: req.body.name, removable: true };
        return res(ctx.json(list));
    }),

    // delete list by id
    rest.delete('/api/v1/lists/:id', (req, res, ctx) => res(ctx.status(204))),

    // add task to list by id
    rest.post('/api/v1/lists/:id/tasks', (req, res, ctx) => {
        const task = {
            id: 1,
            listId: 1,
            text: req.body.text,
            completed: false,
            touched: Date.now(),
        };

        return res(ctx.json(task));
    }),

    // update task by id
    rest.patch('/api/v1/tasks/:id', (req, res, ctx) => {
        const task = {
            id: 1,
            listId: 1,
            completed: req.body.completed,
            touched: Date.now(),
        };

        return res(ctx.json(task));
    }),

    // delete task by id
    rest.delete('/api/v1/tasks/:id', (req, res, ctx) => res(ctx.status(204)))
);

export default server;
