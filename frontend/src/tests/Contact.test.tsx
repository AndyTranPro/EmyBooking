import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from "react-router-dom";
import Contact from '../pages/Contact';
import { request } from '../utils/axios';
import { useGlobalContext } from '../utils/context';
import { AxiosError, AxiosHeaders } from "axios";

// Mock dependencies
jest.mock('../utils/axios');
jest.mock('../utils/context');

const mockDisplaySuccess = jest.fn();
const mockDisplayError = jest.fn();
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
const mockRequestPost = request.post as jest.MockedFunction<typeof request.post>;
const mockUseGlobalContext = useGlobalContext as jest.MockedFunction<typeof useGlobalContext>;

describe('Contact Component', () => {
  beforeEach(() => {
    (useGlobalContext as jest.Mock).mockReturnValue({
      displaySuccess: mockDisplaySuccess,
      displayError: mockDisplayError,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Contact page', () => {
    render(
    <BrowserRouter>
      <Contact />
    </BrowserRouter>
    );
    expect(screen.getByText('Contact us')).toBeInTheDocument();

  }); 

  // test('navigate login when not login', async () => {
  //   const errorMessage = "failed";
  //   const axiosError = new AxiosError(errorMessage, undefined, undefined, undefined, {
  //     data: { msg: errorMessage },
  //     status: 400,
  //     statusText: "Bad Request",
  //     headers: {},
  //     config: {
  //       headers: {} as AxiosHeaders,
  //     },
  //   });

  //   mockRequestPost.mockRejectedValueOnce(axiosError);
  //   render(
  //   <BrowserRouter>
  //     <Contact />
  //   </BrowserRouter>
  //   );
  //   await waitFor(() => {
  //     expect(mockUseGlobalContext().displayError).toHaveBeenCalledWith(errorMessage);
  //   });
  //   expect(mockNavigate).toHaveBeenCalledWith("/login");
  // }); 

  test('handles submit', async () => {
    const feedbackText = 'This is a very good website, I like it very much, I want to reward you with 10 million dollars, please contact me as soon as possible';

    (request.post as jest.Mock).mockResolvedValueOnce({ data: { feedback: feedbackText } });

    render(<BrowserRouter><Contact/></BrowserRouter>);

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(request.post).toHaveBeenCalledTimes(1));

    expect(mockDisplaySuccess).toHaveBeenCalledWith('Sent!');
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test('handles submit fail', async () => {
    const errorMessage = "failed";
    const axiosError = new AxiosError(errorMessage, undefined, undefined, undefined, {
      data: { msg: errorMessage },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {
        headers: {} as AxiosHeaders,
      },
    });

    mockRequestPost.mockRejectedValueOnce(axiosError);

    render(<BrowserRouter><Contact/></BrowserRouter>);

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(mockUseGlobalContext().displayError).toHaveBeenCalledWith(errorMessage);
    });
  });

})