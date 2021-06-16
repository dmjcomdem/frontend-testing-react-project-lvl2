import React from 'react';
import App from '@hexlet/react-todo-app-with-backend';
import { render, waitFor, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import server from '../mocks/server';
import faker from 'faker';

// Initial State Application
const initialState = {
    currentListId: 1,
    lists: [{ id: 1, name: 'primary', removable: false }],
    tasks: [],
};

// Helpers
const addList = (list) => {
    userEvent.type(screen.getByRole('textbox', { name: /new list/i }), list);
    userEvent.click(screen.getByRole('button', { name: /add list/i }));
};

const addTask = (task) => {
    userEvent.type(screen.getByRole('textbox', { name: /new task/i }), task);
    const view = screen.getByTestId('task-form');
    userEvent.click(within(view).getByRole('button', { name: /add/i }));
};

describe('TODO Application', () => {
    beforeAll(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    });

    it('should correctly render start application', () => {
        render(<App {...initialState} />);

        expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new list/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new task/i })).toBeInTheDocument();
        expect(screen.getByText('primary')).toBeInTheDocument();
        expect(screen.getByText('Tasks list is empty')).toBeInTheDocument();
    });

    describe('correctly render tasks in primary list', () => {
        it('should add task in primary list', async () => {
            const task = faker.lorem.words();
            render(<App {...initialState} />);
            addTask(task);
            const taskBox = await screen.findByRole('checkbox', task);

            expect(taskBox).toBeInTheDocument();
        });

        it('should checked completed task in primary list', async () => {
            const task = faker.lorem.words();
            const state = {
                ...initialState,
                tasks: [
                    {
                        id: 1,
                        listId: 1,
                        text: task,
                        completed: false,
                        touched: Date.now(),
                    },
                ],
            };
            render(<App {...state} />);

            expect(await screen.findByText(task)).toBeVisible();
            const taskBox = await screen.findByRole('checkbox', task);
            userEvent.click(taskBox);

            await waitFor(() => {
                expect(taskBox).toBeChecked();
            });
        });

        it('should remove task in primary list', async () => {
            const task = faker.lorem.words();
            const state = {
                ...initialState,
                tasks: [
                    {
                        id: 1,
                        listId: 1,
                        text: task,
                        completed: true,
                        touched: Date.now(),
                    },
                ],
            };
            render(<App {...state} />);

            expect(await screen.findByText(task)).toBeVisible();
            userEvent.click(screen.getByRole('button', { name: /remove/i }));

            await waitFor(() => {
                expect(screen.queryByText(task)).toBeNull();
            });
        });

        it('should required message for add empty task name', async () => {
            render(<App {...initialState} />);
            addTask('');

            await waitFor(() => {
                expect(screen.getByText(/required!/i)).toBeInTheDocument();
            });
        });

        it('should error message for add exists task', async () => {
            const task = faker.lorem.words();
            render(<App {...initialState} />);
            addTask(task);

            await waitFor(() => {
                addTask(task);
                expect(screen.getByText(/already exists/i)).toBeInTheDocument();
            });
        });
    });

    describe('correctly render list', () => {
        it('should create a new list and make it active', async () => {
            const listSecondName = faker.lorem.words();
            const taskForFirstList = faker.lorem.words();
            const state = {
                ...initialState,
                tasks: [
                    {
                        id: 1,
                        listId: 1,
                        text: taskForFirstList,
                        completed: false,
                        touched: Date.now(),
                    },
                ],
            };
            render(<App {...state} />);
            addList(listSecondName);

            const list = await screen.findByRole('button', { name: listSecondName });
            expect(list).toBeInTheDocument();
            expect(screen.getByText('Tasks list is empty')).toBeInTheDocument();
        });

        it('should remove list', async () => {
            const list = faker.lorem.words();
            render(<App {...initialState} />);
            addList(list);

            expect(await screen.findByText(list)).toBeVisible();
            userEvent.click(screen.getByRole('button', { name: /remove list/i }));

            await waitFor(() => {
                expect(screen.queryByText(list)).toBeNull();
            });
        });

        it('should task states persist between lists switching', async () => {
            const [taskForFirstList, taskForSecondList] = [
                faker.lorem.words(),
                faker.lorem.words(),
            ];
            const state = {
                ...initialState,
                currentListId: 2,
                lists: [
                    { id: 1, name: 'primary', removable: false },
                    { id: 2, name: 'second', removable: true },
                ],
                tasks: [
                    {
                        id: 1,
                        listId: 1,
                        text: taskForFirstList,
                        completed: false,
                        touched: Date.now(),
                    },
                    {
                        id: 2,
                        listId: 2,
                        text: taskForSecondList,
                        completed: false,
                        touched: Date.now(),
                    },
                ],
            };
            render(<App {...state} />);

            expect(await screen.findByText(taskForSecondList)).toBeInTheDocument();
            userEvent.click(screen.getByRole('button', { name: /primary/i }));
            expect(await screen.findByText(taskForFirstList)).toBeInTheDocument();
        });

        it('should error message for add exists list', async () => {
            const list = faker.lorem.words();
            render(<App {...initialState} />);
            addList(list);

            await waitFor(() => {
                addList(list);
                expect(screen.getByText(/already exists/i)).toBeInTheDocument();
            });
        });
    });
});
