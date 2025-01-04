import { useEffect, useState } from "react";

function App() {
  // const baseUrl = "https://expresswebapi-tahsilat.onrender.com/api/";
  const baseUrl = process.env.BackendUrl || "http://localhost:3001/api/";
  const [jwt, setJwt] = useState(undefined);
  const [data, setData] = useState([]); // Tabloda görüntülenecek veriler
  const [formData, setFormData] = useState({
    username: "",
    amount: "",
    type: "",
  }); // Form verileri

  const origin = window.location.origin; // Dinamik olarak origin bilgisini al

  // Login işlemi ve başlangıç yüklemeleri
  useEffect(() => {
    fetch(baseUrl + "default", {
      mode: 'cors',
      credentials: 'include',
      headers: {
        "Origin": origin // Dinamik origin
      }
    })
      .then((response) => response.json())
      .then((data) => console.log("Default endpoint response:", data))
      .catch((err) => console.log("Default endpoint error:", err));

    fetch(baseUrl + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin // Dinamik origin
      },
      body: JSON.stringify({ username: "apitest", password: "test123" }),
      mode: 'cors',
      credentials: 'include'
    })
      .then((rsp) => {
        if (!rsp.ok) {
          throw new Error("Login failed");
        }
        return rsp.json();
      })
      .then((rsp) => setJwt(rsp?.response?.token))
      .catch((err) => console.log("Login error:", err));
  }, [origin]);

  // Tüm verileri getirme (getAllData)
  const fetchData = () => {
    fetch(baseUrl + "get", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        "Origin": origin // Dinamik origin
      },
      body: JSON.stringify({
        fieldData: { sort: "desc" },
        script: "getAllData",
      }),
      mode: 'cors',
      credentials: 'include'
    })
      .then((rsp) => rsp.json())
      .then((data) => setData(data?.response || [])) // Verileri state'e kaydet
      .catch((err) => console.log("Fetch data error:", err));
  };

  // Form ile veri ekleme (sync işlemi)
  const handleSync = (e) => {
    e.preventDefault();
    fetch(baseUrl + "sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        "Origin": origin // Dinamik origin
      },
      body: JSON.stringify(formData),
      mode: 'cors',
      credentials: 'include'
    })
      .then((rsp) => rsp.json())
      .then((data) => {
        console.log("Sync response:", data);
        fetchData(); // Verileri yenile
      })
      .catch((err) => console.log("Sync error:", err));
  };

  // Form değişikliklerini işleme
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Component render
  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Data Management</h1>

      {/* Form */}
      <form onSubmit={handleSync} className="mb-5">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="type"
              placeholder="Type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Add Data
        </button>
      </form>

      {/* Tablo */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.username}</td>
                <td>{item.amount}</td>
                <td>{item.type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
