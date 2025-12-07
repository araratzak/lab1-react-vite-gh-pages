import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: {
    city: string;
  };
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = selectedCity
    ? users.filter((user) => user.address.city === selectedCity)
    : users;

  const resetFilter = () => {
    setSelectedCity("");
  };

  return (
    <div className="user-table-container">
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? "Загрузка..." : "Загрузить пользователей"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {users.length > 0 && (
        <>
          <div style={{ marginTop: "20px", marginBottom: "10px" }}>
            <label htmlFor="city-filter" style={{ marginRight: "10px" }}>
              Фильтр по городу:
            </label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ marginRight: "10px", padding: "5px" }}
            >
              <option value="">Все города</option>
              <option value="Moscow">Moscow</option>
              <option value="Kulm">Kulm</option>
              <option value="London">London</option>
            </select>
            {selectedCity && (
              <button onClick={resetFilter} style={{ padding: "5px 10px" }}>
                Сбросить фильтр
              </button>
            )}
          </div>
          <table
            border={1}
            style={{
              marginTop: "20px",
              borderCollapse: "collapse",
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Сайт</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <a
                      href={`http://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
