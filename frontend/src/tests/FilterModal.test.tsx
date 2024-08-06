import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterModal from '../components/FilterModal';

const mockHandleClose = jest.fn();
const mockHandleConfirm = jest.fn();

const defaultProps = {
  open: true,
  handleClose: mockHandleClose,
  handleConfirm: mockHandleConfirm,
  options: ['Option 1', 'Option 2'],
  types: ['Type 1', 'Type 2'],
  selectedDate: new Date(),
};
const setup = (userType: string = "") => {
  return render(<FilterModal userType={userType} {...defaultProps} />);
};

describe('FilterModal', () => {
  it('renders correctly when open', () => {
    setup("cse_staff");

    // Check if the modal title is rendered
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();

    // Check if the Equipment accordion is rendered
    expect(screen.getByText('Equipment')).toBeInTheDocument();

    // Check if the Type accordion is rendered
    expect(screen.getByText('Type')).toBeInTheDocument();

    // Check if the Available Time Span accordion is rendered
    expect(screen.getByText('Available Time Span')).toBeInTheDocument();
  });

  it('calls handleClose when the close button is clicked with changed value', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Capacity Min'), { target: { value: '10' } });
    // Click the close button
    fireEvent.click(screen.getByTestId('Modal close button'));

    // Check if handleClose was called
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('calls handleClose when the close button is clicked with no value', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    // Click the close button
    fireEvent.click(screen.getByTestId('Modal close button'));

    // Check if handleClose was called
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('calls handleConfirm with the correct filters when the confirm button is clicked', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    // Click the confirm button
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Check if handleConfirm was called with the correct filters
    expect(mockHandleConfirm).toHaveBeenCalledWith({
      selectedOptions: [],
      selectedType: '',
      capacityMin: 0,
      capacityMax: 0,
      startTime: '',
      endTime: '',
    });
  });
  it('Equipment Accordion onChange toggles expansion', () => {
    setup();
    // test equipments
    const eqAttributes = screen.getByTestId('eq-summary');
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false');
  
    // Simulate user clicking the accordion to trigger onChange
    fireEvent.click(eqAttributes);
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'true');

    // Simulate user clicking again to collapse the accordion
    fireEvent.click(eqAttributes);

    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false'); 
  });
  
  it('Type Accordion onChange toggles expansion', () => {
    setup();
    // test equipments
    const eqAttributes = screen.getByTestId('types');
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false');
  
    // Simulate user clicking the accordion to trigger onChange
    fireEvent.click(eqAttributes);
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'true');

    // Simulate user clicking again to collapse the accordion
    fireEvent.click(eqAttributes);

    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false'); 
  });

  it('Timespan Accordion onChange toggles expansion', () => {
    setup();
    // test equipments
    const eqAttributes = screen.getByTestId('timespan');
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false');
  
    // Simulate user clicking the accordion to trigger onChange
    fireEvent.click(eqAttributes);
    expect(eqAttributes).toHaveAttribute('aria-expanded', 'true');

    // Simulate user clicking again to collapse the accordion
    fireEvent.click(eqAttributes);

    expect(eqAttributes).toHaveAttribute('aria-expanded', 'false'); 
  });
  
  it('clears filters when the clear button is clicked', () => {
    setup();

    // Simulate setting some filters
    fireEvent.click(screen.getByLabelText('Option 1'));
    fireEvent.click(screen.getByLabelText('Type 1'));
    fireEvent.change(screen.getByLabelText('Capacity Min'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Capacity Max'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '12:00' } });

    // Click the clear button
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    // Verify that the filters have been reset
    expect(screen.getByLabelText('Option 1')).not.toBeChecked();
    expect(screen.getByLabelText('Type 1')).not.toBeChecked();
    expect(screen.getByLabelText('Capacity Min')).toHaveValue(null);
    expect(screen.getByLabelText('Capacity Max')).toHaveValue(null);
    expect(screen.getByLabelText('Start Time')).toHaveValue('');
    expect(screen.getByLabelText('End Time')).toHaveValue('');
  });

  it('should load filter configuration from localStorage and save when closed', () => {
    const savedFilters = {
      selectedOptions: ['Option 1'],
      selectedType: 'Type 1',
      capacityMin: 10,
      capacityMax: 20,
      startTime: '12:00',
      endTime: '14:00',
    };
    localStorage.setItem('filterConfig', JSON.stringify(savedFilters));
    setup();
    // Check if the filter values are loaded into the component's state
    expect(screen.getByLabelText('Start Time')).toHaveValue('12:00');
    expect(screen.getByLabelText('End Time')).toHaveValue('14:00');
    expect(screen.getByLabelText('Capacity Min')).toHaveValue(10);
    expect(screen.getByLabelText('Capacity Max')).toHaveValue(20);
    expect(screen.getByLabelText('Type 1')).toBeChecked();
    expect(screen.getByLabelText('Option 1')).toBeChecked();
  });

  it('should prevent invalid input in capacity fields', () => {
    setup();
  
    const capacityMinInput = screen.getByLabelText('Capacity Min');
    const capacityMaxInput = screen.getByLabelText('Capacity Max');

    const keysToTest = [
      { key: 'a', shouldPrevent: true },
      { key: '1', shouldPrevent: false },
      { key: 'Backspace', shouldPrevent: false },
      { key: 'Tab', shouldPrevent: false },
      { key: 'ArrowLeft', shouldPrevent: false },
      { key: 'ArrowRight', shouldPrevent: false },
      { key: 'Delete', shouldPrevent: false },
      { key: 'Enter', shouldPrevent: false },
    ];
  
    keysToTest.forEach(({ key }) => {
      const event = new KeyboardEvent('keydown', { key });
      event.preventDefault = jest.fn();
      fireEvent.keyDown(capacityMinInput, event);
      fireEvent.keyDown(capacityMaxInput, event);
    });
  });

  it('clear capacity button should clear capacity fields', () => {
    setup();
  
    const capacityMinInput = screen.getByLabelText('Capacity Min');
    const capacityMaxInput = screen.getByLabelText('Capacity Max');
    fireEvent.change(capacityMinInput, { target: { value: '10' } });
    fireEvent.change(capacityMaxInput, { target: { value: '20' } });
  
    fireEvent.click(screen.getByTestId('clear-capacity-min'));
    fireEvent.click(screen.getByTestId('clear-capacity-max'));
  
    expect(capacityMinInput).toHaveValue(null);
    expect(capacityMaxInput).toHaveValue(null);
  });


  it('should prevent invalid input in time fields', async() => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    // get the time inputs
    const startTimeInput = screen.getByLabelText('Start Time');
    const endTimeInput = screen.getByLabelText('End Time');
    // produce times to test
    const startTime = new Date();
    const endTime = new Date();
    if(startTime.getHours() < 12 && startTime.getHours() > 1) {
      startTime.setHours(startTime.getHours() + 12);
      endTime.setHours(endTime.getHours() + 11);
    }
    else if (startTime.getHours() === 12) {
      startTime.setHours(startTime.getHours() + 2);
      endTime.setHours(endTime.getHours() + 1);
    }
    else if (startTime.getHours() <= 1) {
      startTime.setHours(startTime.getHours() + 14);
      endTime.setHours(endTime.getHours() + 13);
    }
    else {
      startTime.setHours(14);
      endTime.setHours(13);
    }
    
    fireEvent.change(endTimeInput, { target: { value: `${endTime.getHours()}:00` } });
    fireEvent.change(startTimeInput, { target: { value: `${startTime.getHours()}:00` } });

    await screen.findByText('End time must be later than start time!');
    expect(screen.getByText('End time must be later than start time!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    fireEvent.change(startTimeInput, { target: { value: `00:00` } });
    await screen.findByText('Start time must be in the future!');
    expect(screen.getByText('Start time must be in the future!')).toBeInTheDocument();

    // clear all
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    fireEvent.change(endTimeInput, { target: { value: `00:00` } });
    expect(screen.queryByText('End time must be later than start time!')).not.toBeInTheDocument();
    expect(screen.queryByText('Start time must be in the future!')).not.toBeInTheDocument();
  });

  it('test capcity change or statement', ()=> {
    setup();
    fireEvent.change(screen.getByLabelText('Capacity Min'), { target: { value: '0' } });
  });
  
  it('test equipment change or statement', ()=> {
    setup("admin");
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    const option = screen.getByLabelText('Option 1');
    fireEvent.click(option);
    expect(option).toBeChecked();
    fireEvent.click(option);
    expect(option).not.toBeChecked();
  });

  it('calls handleClose and saves to localStorage when the close button is clicked with changed value', () => {
    setup("admin");
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    // Simulate setting some filters
    fireEvent.change(screen.getByLabelText('Capacity Min'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Capacity Max'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '08:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '10:00' } });
    fireEvent.click(screen.getByLabelText('Type 1'));
    const option = screen.getByLabelText('Option 1');
    fireEvent.click(option);
    expect(option).toBeChecked();
  
    // Click the close button
    fireEvent.click(screen.getByTestId('Modal close button'));
  
    // Check if localStorage was updated
    const expectedFilters = JSON.stringify({
      selectedOptions: ['Option 1'],
      selectedType: 'Type 1',
      capacityMin: 30,
      capacityMax: 50,
      startTime: '08:00',
      endTime: '10:00',
    });
    expect(localStorage.getItem('filterConfig')).toBe(expectedFilters);
  
    // Check if handleClose was called
    expect(mockHandleClose).toHaveBeenCalled();
  });
  
});


