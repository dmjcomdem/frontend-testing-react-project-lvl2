import { rest } from 'msw';
import { nanoid } from 'nanoid';
import { setupServer } from 'msw/node';

const primaryListId = nanoid();

export const initialState = {
  currentListId: primaryListId,
  lists: [{ id: primaryListId, name: 'Primary', removable: false }],
  tasks: [],
};

const setServer = (initState = initialState) => {
  let { tasks = [] } = initState;

  return setupServer(
    rest.post('/api/v1/lists', (req, res, ctx) => {
      const list = {
        id: nanoid(),
        name: req.body.name,
        removable: true,
      };
      return res(ctx.delay(), ctx.json(list));
    }),

    rest.delete('/api/v1/lists/:id', (req, res, ctx) =>
      res(ctx.delay(), ctx.status(204))
    ),

    rest.post('/api/v1/lists/:id/tasks', (req, res, ctx) => {
      const task = {
        id: nanoid(),
        listId: req.params.id,
        text: req.body.text,
        completed: false,
        touched: Date.now(),
      };

      tasks = [...tasks, task];
      return res(ctx.delay(), ctx.json(task));
    }),

    rest.patch('/api/v1/tasks/:id', (req, res, ctx) => {
      const currentTask = tasks.find((task) => task.id === req.params.id); // ? tasks
      const checkedTask = {
        ...currentTask,
        completed: req.body.completed,
        touched: Date.now(),
      };
      tasks = tasks.map((task) => (task.id === req.params.id ? checkedTask : task));

      return res(ctx.delay(), ctx.json(checkedTask));
    }),

    rest.delete('/api/v1/tasks/:id', (req, res, ctx) => {
      tasks = tasks.filter(({ id }) => id !== req.params.taskId);

      return res(ctx.delay(), ctx.status(204));
    })
  );
};

export default setServer;
