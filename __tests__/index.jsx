import React from 'react';
import App from '@hexlet/react-todo-app-with-backend';
import {
  render,
  waitFor,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import faker from 'faker';
import { rest } from 'msw';
import setServer, { initialState } from '../mocks/server';

// Helpers
const addTask = (task) => {
  userEvent.type(screen.getByRole('textbox', { name: /new task/i }), task);
  userEvent.click(screen.getByRole('button', { name: 'Add' }));
  return screen.findByText(task);
};

const addList = (list) => {
  const addButton = screen.getByRole('button', { name: /add list/i });
  userEvent.type(screen.getByRole('textbox', { name: /new list/i }), list);
  userEvent.click(addButton);
  return screen.findByText(list);
};

const errorMessage = /network error/i;

describe('TODO Application', () => {
  let server;

  beforeEach(async () => {
    server = setServer(initialState);
    render(<App {...initialState} />);
    server.listen({ onUnhandledRequest: 'warn' });
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('should correctly render start application', () => {
    expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /new list/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Tasks list is empty')).toBeInTheDocument();
  });

  describe('correctly render tasks', () => {
    it('should add task', async () => {
      const taskText = faker.lorem.words();
      const input = screen.getByRole('textbox', { name: /new task/i });
      const button = screen.getByRole('button', { name: 'Add' });
      userEvent.type(input, taskText);
      userEvent.click(button);

      expect(input).toHaveAttribute('readonly');
      expect(button).toBeDisabled();
      expect(await screen.findByText(taskText)).toBeInTheDocument();
      expect(input).not.toHaveAttribute('readonly');
      expect(button).not.toBeDisabled();
    });

    it('should checked completed task', async () => {
      const taskText = faker.lorem.words();
      const taskElement = await addTask(taskText);
      const checkbox = screen.getByRole('checkbox', { name: taskText });

      expect(taskElement).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();

      userEvent.click(checkbox);

      expect(checkbox).toBeDisabled();
      await waitFor(() => expect(checkbox).toBeChecked());
      expect(checkbox).toBeEnabled();
    });

    it('should remove task', async () => {
      const taskText = faker.lorem.words();
      const taskElement = await addTask(taskText);
      const button = screen.getByRole('button', { name: 'Remove' });
      userEvent.click(button);

      expect(button).toBeDisabled();
      await waitForElementToBeRemoved(taskElement);
      expect(taskElement).not.toBeInTheDocument();
    });

    describe('error handler', () => {
      it('should required message for add empty task name', async () => {
        userEvent.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => {
          expect(screen.queryByText(/required!/i)).toBeVisible();
        });
      });

      it('should error message for add exists task', async () => {
        const taskText = faker.lorem.words();
        await addTask(taskText);
        await addTask(taskText);

        expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
      });

      it('should return error when add task with a status of 500', async () => {
        server.use(
          rest.post('/api/v1/lists/:id/tasks', (req, res, ctx) => res(ctx.status(500)))
        );
        const taskText = faker.lorem.words();
        userEvent.type(screen.getByRole('textbox', { name: /new task/i }), taskText);
        userEvent.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => {
          expect(screen.queryByText(taskText)).not.toBeInTheDocument();
          expect(screen.queryByText(errorMessage)).toBeVisible();
        });
      });

      it('should return error when checkbox task with a status of 500', async () => {
        server.use(
          rest.patch('/api/v1/tasks/:id', (req, res, ctx) => res(ctx.status(500)))
        );
        const taskText = faker.lorem.words();
        userEvent.click(await addTask(taskText));

        await waitFor(() => {
          expect(screen.queryByText(errorMessage)).toBeVisible();
        });
      });

      it('should return error when remove task with a status of 500', async () => {
        server.use(
          rest.delete('/api/v1/tasks/:id', (req, res, ctx) => res(ctx.status(500)))
        );
        await addTask(faker.lorem.words());
        const button = screen.getByRole('button', { name: 'Remove' });
        userEvent.click(button);

        await waitFor(() => {
          expect(screen.queryByText(errorMessage)).toBeVisible();
        });
      });
    });
  });

  describe('correctly render list', () => {
    it('should create a new list', async () => {
      const listName = faker.lorem.words();
      const input = screen.getByRole('textbox', { name: /new list/i });
      const button = screen.getByRole('button', { name: /add list/i });
      userEvent.type(input, listName);
      userEvent.click(button);

      expect(input).toHaveAttribute('readonly');
      expect(button).toBeDisabled();
      expect(await screen.findByText(listName)).toBeInTheDocument();
      expect(input).not.toHaveAttribute('readonly');
      expect(button).not.toBeDisabled();
    });

    it('should create a new list and make it active', async () => {
      const taskInFirstList = await addTask(faker.lorem.words());
      const secondList = await addList(faker.lorem.words());

      expect(taskInFirstList).not.toBeInTheDocument();
      expect(secondList).toBeInTheDocument();
    });

    it('should remove list', async () => {
      const listName = faker.lorem.words();
      const listElement = await addList(listName);
      const button = screen.getByRole('button', { name: /remove list/i });

      expect(listElement).toBeInTheDocument();
      userEvent.click(button);
      expect(button).toBeDisabled();
      await waitForElementToBeRemoved(listElement);
      expect(listElement).not.toBeInTheDocument();
    });

    it('should task states persist between lists switching', async () => {
      const [firstListName, secondListName] = ['Primary', 'Second'];
      const [taskFirstListText, taskSecondListText] = [
        faker.lorem.words(),
        faker.lorem.words(),
      ];

      const firstList = screen.getByRole('button', { name: firstListName });
      const taskFirstList = await addTask(taskFirstListText);
      expect(taskFirstList).toBeInTheDocument();

      await addList(secondListName);
      const taskSecondList = await addTask(taskSecondListText);
      expect(taskFirstList).not.toBeInTheDocument();
      expect(taskSecondList).toBeInTheDocument();
      userEvent.click(firstList);
      expect(screen.getByText(taskFirstListText)).toBeInTheDocument();
    });

    describe('error handler', () => {
      it('should required message for add empty list name', async () => {
        userEvent.click(screen.getByRole('button', { name: /add list/i }));

        await waitFor(() => {
          expect(screen.queryByText(/required!/i)).toBeVisible();
        });
      });

      it('should error message for add exists list', async () => {
        const taskText = faker.lorem.words();
        await addList(taskText);
        await addList(taskText);

        expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
      });

      it('should return error when add list with a status of 500', async () => {
        server.use(rest.post('/api/v1/lists', (req, res, ctx) => res(ctx.status(500))));
        const listText = faker.lorem.words();
        userEvent.type(screen.getByRole('textbox', { name: /new list/i }), listText);
        userEvent.click(screen.getByRole('button', { name: 'add list' }));

        await waitFor(() => {
          expect(screen.queryByText(listText)).not.toBeInTheDocument();
          expect(screen.queryByText(errorMessage)).toBeVisible();
        });
      });

      it('should return error when remove list with a status of 500', async () => {
        server.use(
          rest.delete('/api/v1/lists/:id', (req, res, ctx) => res(ctx.status(500)))
        );
        await addList(faker.lorem.words());
        const button = screen.getByRole('button', { name: /remove list/i });
        userEvent.click(button);

        await waitFor(() => {
          expect(screen.queryByText(errorMessage)).toBeVisible();
        });
      });
    });
  });
});
