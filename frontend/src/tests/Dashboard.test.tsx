import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from 'react-router-dom';

describe('Dashboard Component', () => {
  beforeEach(() => {
    render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );
  });
  test('renders initial state correctly', () => {
    
    // Check initial level
    expect(screen.getByText('Level Two')).toBeInTheDocument();
    
    // Check initial date
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    
    // Check initial view button
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  test('date navigation buttons work correctly', () => {
    
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    // Check if the backward button is disabled initially
    expect(screen.getByTestId("dateBack")).toBeDisabled();
    
    // Move date forward
    fireEvent.click(screen.getByTestId("dateForward"));
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const formattedNextDay = `${nextDay.getDate()}/${nextDay.getMonth() + 1}/${nextDay.getFullYear()}`;
    expect(screen.getByText(formattedNextDay)).toBeInTheDocument();
    
    // Move date backward
    fireEvent.click(screen.getByTestId("dateBack"));
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  test('level selection works correctly', async () => {
    console.error = jest.fn();
    console.warn = jest.fn();
    const select = screen.getByText('Level Two');
    await act(async () => {
      userEvent.click(select);
    });
  
    const levelFour = await screen.findByText('Level Four');
    await act(async () => {
      userEvent.click(levelFour);
    });
    await waitFor(() => expect(screen.queryByText('Level Two')).toBeNull());
    expect(screen.getByText('Level Four')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Level Three')).toBeNull());
    await waitFor(() => expect(screen.queryByText('Level Five')).toBeNull());
  });

  test('view switch button works correctly', () => {
    
    // Switch to Map View
    fireEvent.click(screen.getByText('Map View'));
    expect(screen.getByText('Timetable View')).toBeInTheDocument();
    
    // Switch back to Timetable View
    fireEvent.click(screen.getByText('Timetable View'));
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });
});