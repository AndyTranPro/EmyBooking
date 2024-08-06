import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { BrowserRouter } from 'react-router-dom';
import { useGlobalContext } from '../utils/context';
import { request } from '../utils/axios';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';

// Mock the useGlobalContext hook
jest.mock('../utils/context', () => ({
  useGlobalContext: jest.fn(),
}));

// Mock the axios request
jest.mock('../utils/axios', () => ({
  request: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ResponsiveAppBar', () => {
  const mockDisplaySuccess = jest.fn();
  const mockDisplayError = jest.fn();
  const mockRemoveToken = jest.fn();
  const mockRemoveAdmin = jest.fn();
  const mockHandleCloseNotificationSettingsModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponentWithUserType = (userType: string, userName: string, userZid: string) => {
    (useGlobalContext as jest.Mock).mockReturnValue({
      token: { type: userType, name: userName, zid: userZid },
      removeToken: mockRemoveToken,
      displaySuccess: mockDisplaySuccess,
      displayError: mockDisplayError,
      removeAdmin: mockRemoveAdmin,
      handleCloseNotificationSettingsModal: mockHandleCloseNotificationSettingsModal,
    });
    render(
      <BrowserRouter>
        <ResponsiveAppBar numCheckIns={5} numRequests={10} />
      </BrowserRouter>
    );
  };

  test('renders the app bar with correct elements', () => {
    renderComponentWithUserType('admin', 'Admin User', 'z1234567');
    expect(screen.getAllByText(/CSE-ROOMS/i)).toHaveLength(2);
    expect(screen.getByText('myBookings')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getAllByText('requests')).toHaveLength(2);
    expect(screen.getAllByText('reports')).toHaveLength(2);
    expect(screen.getByText('Admin User (z1234567) | Admin')).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    renderComponentWithUserType('admin', 'Admin User', 'z1234567');
    (request.get as jest.MockedFunction<typeof request.get>).mockResolvedValueOnce({});

    expect(screen.getByText('Logout')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Logout'));

    expect(request.get).toHaveBeenCalledWith('/auth/logout');
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockRemoveAdmin).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockDisplaySuccess).toHaveBeenCalledWith('Successfully Logged out');
  });

  test('should display the user name and type for admin', () => {
    renderComponentWithUserType('admin', 'Admin User', 'z1234567');
    expect(screen.getByText(/Admin User \(z1234567\) \| Admin/i)).toBeInTheDocument();
  });

  test('should display the user name and type for hdr_student', () => {
    renderComponentWithUserType('hdr_student', 'HDR Student', 'z7654321');
    expect(screen.getByText(/HDR Student \(z7654321\) \| HDR Student/i)).toBeInTheDocument();
  });

  test('should display the user name and type for cse_staff', () => {
    renderComponentWithUserType('cse_staff', 'CSE Staff', 'z1122334');
    expect(screen.getByText(/CSE Staff \(z1122334\) \| CSE Staff/i)).toBeInTheDocument();
  });

  test('should display the user name and type for non_cse_staff', () => {
    renderComponentWithUserType('non_cse_staff', 'Non-CSE Staff', 'z5566778');
    expect(screen.getByText(/Non-CSE Staff \(z5566778\) \| Non CSE Staff/i)).toBeInTheDocument();
  });

  test('should display an error message when handleLogout is unsuccessful', async () => {

    renderComponentWithUserType('admin', 'Admin User', 'z1234567');
    const errorMessage = "Failed to logout";
    const axiosError = new AxiosError(errorMessage, undefined, undefined, undefined, {
      data: { msg: errorMessage },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {
        headers: {} as AxiosHeaders,
      },
    });

    (request.get as jest.MockedFunction<typeof request.get>).mockRejectedValueOnce(axiosError);

    expect(screen.getByText('Logout')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Logout'));

    expect(request.get).toHaveBeenCalledWith('/auth/logout');
    // Simulate the logout button click
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(useGlobalContext().displayError).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('handles opening and closing notification settings modal', async () => {
    renderComponentWithUserType('admin', 'Admin User', 'z1234567');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('settings'));
  });
});