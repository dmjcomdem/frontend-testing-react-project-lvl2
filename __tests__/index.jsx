import React from 'react';
import App from '@hexlet/react-todo-app-with-backend';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TODO Application', () => {
    it('should render start application', () => {
        render(<App />);
        expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new list/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /new task/i })).toBeInTheDocument();
    });
});
