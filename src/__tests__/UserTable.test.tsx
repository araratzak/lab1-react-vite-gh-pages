import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import UserTable from "../components/UserTable";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("UserTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders button and does not show table initially", () => {
    render(<UserTable />);
    expect(screen.getByText(/загрузить пользователей/i)).toBeInTheDocument();
    expect(screen.queryByText(/иван/i)).not.toBeInTheDocument();
  });

  test("loads users and displays them when button is clicked", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (999) 123-45-67",
        website: "example.com",
        address: {
          city: "Moscow",
        },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserTable />);
    fireEvent.click(screen.getByText(/загрузить пользователей/i));

    expect(await screen.findByText(/иван иванов/i)).toBeInTheDocument();
    expect(screen.getByText(/ivan@example.com/i)).toBeInTheDocument();
  });

  test("shows error when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<UserTable />);
    fireEvent.click(screen.getByText(/загрузить пользователей/i));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  test("filters users by city", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (999) 123-45-67",
        website: "example.com",
        address: {
          city: "Moscow",
        },
      },
      {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 (555) 123-45-67",
        website: "johndoe.com",
        address: {
          city: "London",
        },
      },
      {
        id: 3,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1 (555) 987-65-43",
        website: "janesmith.com",
        address: {
          city: "Moscow",
        },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserTable />);
    fireEvent.click(screen.getByText(/загрузить пользователей/i));

    // Ждем загрузки всех пользователей
    expect(await screen.findByText(/иван иванов/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();

    // Выбираем фильтр по городу Moscow
    const citySelect = screen.getByLabelText(/фильтр по городу/i);
    fireEvent.change(citySelect, { target: { value: "Moscow" } });

    // Проверяем, что отображаются только пользователи из Moscow
    expect(screen.getByText(/иван иванов/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();

    // Проверяем наличие кнопки "Сбросить фильтр"
    expect(screen.getByText(/сбросить фильтр/i)).toBeInTheDocument();

    // Меняем фильтр на London
    fireEvent.change(citySelect, { target: { value: "London" } });

    // Проверяем, что отображается только пользователь из London
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/иван иванов/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();

    // Сбрасываем фильтр
    fireEvent.click(screen.getByText(/сбросить фильтр/i));

    // Проверяем, что все пользователи снова отображаются
    expect(screen.getByText(/иван иванов/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
  });
});
