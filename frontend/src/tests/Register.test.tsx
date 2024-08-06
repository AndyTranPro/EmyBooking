import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { BrowserRouter } from "react-router-dom";
import { useGlobalContext } from "../utils/context";
import { request } from "../utils/axios";
import Register from "../pages/Register";
import { AxiosError, AxiosHeaders } from "axios";

jest.mock("../utils/context");
jest.mock("../utils/axios");

const mockUseGlobalContext = useGlobalContext as jest.MockedFunction<typeof useGlobalContext>;
const mockRequestPost = request.post as jest.MockedFunction<typeof request.post>;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Register Component", () => {
  beforeEach(() => {
    mockUseGlobalContext.mockReturnValue({
      displayError: jest.fn(),
      displaySuccess: jest.fn(),
      displayWarning: jest.fn(),
      displayInfo: jest.fn(),
      handleToken: jest.fn(),
      removeToken: jest.fn(),
      token: null,
      handleOTP: jest.fn(),
      removeOTP: jest.fn(),
      otp: 0,
      handleEmail: jest.fn(),
      removeEmail: jest.fn(),
      email: "",
      handleAdmin: jest.fn(),
      removeAdmin: jest.fn(),
      admin: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/your password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password456" } });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    expect(mockUseGlobalContext().displayError).toHaveBeenCalledWith("Passwords dont match");
  });

  it("registers successfully and navigates to login page", async () => {
    mockRequestPost.mockResolvedValueOnce({ data: {} });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/your password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockUseGlobalContext().displaySuccess).toHaveBeenCalledWith("Registered Successfully! An email will be sent to you with verification instructions");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows error when registration fails", async () => {
    const errorMessage = "Registration failed";
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

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/your password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });

    fireEvent.submit(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockUseGlobalContext().displayError).toHaveBeenCalledWith(errorMessage);
    });
  });
});