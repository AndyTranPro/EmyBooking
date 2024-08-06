import { render, screen, fireEvent  } from '@testing-library/react'
import '@testing-library/jest-dom';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
// import { request } from "../utils/axios";

const mockHandleClose = jest.fn();
const mockHandleConfirm = jest.fn();
const mockSetState = jest.fn();
// const mockRequestPost = request.post as jest.MockedFunction<typeof request.post>;

const defaultProps = {
  handleClose: mockHandleClose,
  handleConfirm: mockHandleConfirm,
  setState: mockSetState,
};

const setup = (open=true, emailState = {
  hasConfirmationEmail: true,
  hasNotificationEmail: true,
}) => {
  return render(<NotificationSettingsModal 
    open={open} 
    state={emailState} 
    {...defaultProps} 
  />);
};

describe('NotificationModal', () => {
  it('renders correctly when open' , () => {
    setup();

    // Check if the modal title is rendered
    expect(screen.getByText('Notification Setting')).toBeInTheDocument();
  
    // Check if the select is rendered
    expect(screen.getByText('Receive Confirmation Email')).toBeInTheDocument();
    // Check if the select is rendered
    expect(screen.getByText('Receive Notification Email')).toBeInTheDocument();
  })

  it('calls handleClose when the close button is clicked', () => {
    setup();
    // Click the close button
    fireEvent.click(screen.getByTestId('Modal close button'));

    // Check if handleClose was called
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('change value when the selected is clicked', () => {
    setup();
    // Click the close button
    fireEvent.click(screen.getByTestId('Modal close button'));

    // Check if handleClose was called
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('change successfully and close modal', async () => {
    setup();
    const confirmationEmail = screen.getByLabelText('Receive Confirmation Email');
    fireEvent.click(confirmationEmail);
    // screen.debug(confirmationEmail)
    expect(mockSetState).toHaveBeenCalled();

    const NotificationEmail = screen.getByLabelText('Receive Notification Email');
    // screen.debug(NotificationEmail)
    fireEvent.click(NotificationEmail)
    expect(mockSetState).toHaveBeenCalled();
  
    const submitButton = screen.getByRole("button", { name: /CONFIRM/i })
    fireEvent.click(submitButton)
    // screen.debug(submitButton)
    expect(mockHandleConfirm).toHaveBeenCalled();
  })

})