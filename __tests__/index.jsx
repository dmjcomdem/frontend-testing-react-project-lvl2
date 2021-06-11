import React from 'react';
import App from '@hexlet/react-todo-app-with-backend';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import server from '../mocks/server';

// Initial State Application
const initialState = {
    currentListId: 1,
    lists: [{ id: 1, name: 'primary', removable: false }],
    tasks: [],
};

// Helper
const addList = (list) => {
    userEvent.type(screen.getByRole('textbox', { name: /new list/i }), list);
    userEvent.click(screen.getByRole('button', { name: /add list/i }));
};

const addTask = (task) => {
    userEvent.type(screen.getByRole('textbox', { name: /new task/i }), task);
    userEvent.click(screen.getByRole('button', { name: 'Add' }));
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

    it('should render start application', () => {
        render(<App />);
        expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new list/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new task/i })).toBeInTheDocument();
    });
});
