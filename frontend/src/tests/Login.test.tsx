import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { useGlobalContext } from "../utils/context";
import { request } from "../utils/axios";
import '@testing-library/jest-dom';
import { AxiosError, AxiosHeaders } from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("../utils/context");
jest.mock("../utils/axios");

const mockUseGlobalContext = useGlobalContext as jest.MockedFunction<typeof useGlobalContext>;
const mockRequestPost = request.post as jest.MockedFunction<typeof request.post>;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));


describe("Login Component", () => {
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

  it("renders the login form", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("displays error message on login failure", async () => {
    const errorMessage = "password doesn't match";
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
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockUseGlobalContext().displayError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("submits the login form successfully", async () => {
    const mockResponse = { user: { type: "user", token: "mock-token" } };
    mockRequestPost.mockResolvedValueOnce({ data: mockResponse });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "password" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockUseGlobalContext().handleToken).toHaveBeenCalledWith(mockResponse.user);
      expect(mockUseGlobalContext().handleEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockUseGlobalContext().displaySuccess).toHaveBeenCalledWith("Logged In");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("checks if the user is already logged in", async () => {
    const mock = new MockAdapter(request);
    mock.onGet("/users/showMe").reply(200);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockUseGlobalContext().displaySuccess).toHaveBeenCalledWith("Logged In");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles admin login", async () => {
    const mockResponse = { user: { type: "admin", token: "mock-token" } };
    mockRequestPost.mockResolvedValueOnce({ data: mockResponse });
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "password" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockUseGlobalContext().handleToken).toHaveBeenCalledWith(mockResponse.user);
      expect(mockUseGlobalContext().handleEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockUseGlobalContext().handleAdmin).toHaveBeenCalled();
      expect(mockUseGlobalContext().displaySuccess).toHaveBeenCalledWith("Logged In");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
