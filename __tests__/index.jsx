import React from 'react';
import App from '@hexlet/react-todo-app-with-backend';
import { render, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import server from '../mocks/server';
import faker from 'faker';

// Initial State Application
const initialState = {
    currentListId: 1,
    lists: [{ id: 1, name: 'primary', removable: false }],
    tasks: [],
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
    });

    it('should add task in primary list', async () => {
        const task = faker.lorem.words();

        render(<App {...initialState} />);
        userEvent.type(screen.getByRole('textbox', { name: /new task/i }), task);
        userEvent.click(screen.getByRole('button', { name: 'Add' }));

        const taskBox = await screen.findByRole('checkbox', task); // ?
        expect(taskBox).toBeInTheDocument();
    });

    it('should checked completed task in primary list', async () => {
        const task = faker.lorem.words();
        const state = {
            ...initialState,
            tasks: [{ id: 1, listId: 1, text: task, completed: false, touched: Date.now() }],
        };
        render(<App {...state} />);

        expect(await screen.findByText(task)).toBeVisible();
        const taskBox = await screen.findByRole('checkbox', task); // ?
        userEvent.click(taskBox);
        expect(await taskBox).toBeChecked();
    });

    it('should remove task in primary list', async () => {
        const task = faker.lorem.words();
        const state = {
            ...initialState,
            tasks: [{ id: 1, listId: 1, text: task, completed: true, touched: Date.now() }],
        };
        render(<App {...state} />);

        expect(await screen.findByText(task)).toBeVisible();
        userEvent.click(screen.getByRole('button', { name: /remove/i }));

        await waitFor(() => expect(screen.queryByText(task)).toBeNull());
    });

    it.todo('✅ приложение рендерится');

    it.todo('добавляются/отмечаются/удаляются задчи в primary лист');
    it.todo('отображается ошибка при добавление пустого текста при добавлении таска');
    it.todo('отображается ошибка при одинакого названия таска');

    it.todo('добавляеется и удаляется новый лист');
    it.todo('отображается ошибка обязательности заполнения поля при создании нового листа');
    it.todo('отображается ошибка при добавлении одинакого названия листа');
    it.todo('возможность добавлять удалять задачи в новом листе');
    it.todo('состояния задач сохраняются между переключениями листов');
});
