import { useEffect, useState } from "react";

function App() {
  const baseUrl = "https://expresswebapi-tahsilat.onrender.com/api/";
  const [jwt, setJwt] = useState(undefined);
  const [data, setData] = useState([]); // Tabloda görüntülenecek veriler
  const [formData, setFormData] = useState({
    username: "",
    amount: "",
    type: "",
  }); // Form verileri
  const [refreshFormData, setRefreshFormData] = useState({
    username: "",
    password: "",
  }); // Token yenileme form verileri
  const [showRefreshForm, setShowRefreshForm] = useState(false); // Token yenileme formunun görünürlüğü
  const [savedCredentials, setSavedCredentials] = useState({
    username: "",
    password: "",
  }); // Başarılı token yenileme sonrası kaydedilen kullanıcı bilgileri

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
      .then((rsp) => {
        setJwt(rsp?.response?.token);
      })
      .catch((err) => console.log("Login error:", err));
  }, [origin]);

  useEffect(() => {
    if (jwt) {
      fetchData(); // JWT token set edildikten sonra verileri yenile
    }
  }, [jwt]);

  // Tüm verileri getirme (getAllData)
  const fetchData = () => {
    if (!jwt) {
      alert("Please refresh the token.");
      return;
    }
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
      .then((data) => setData(data?.response?.scriptResult || []))
      .catch((err) => console.log("Fetch data error:", err));
  };

  // Form ile veri ekleme (sync işlemi)
  const handleSync = (e) => {
    e.preventDefault();
    if (!jwt) {
      alert("Please refresh the token.");
      return;
    }
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

  // Token yenileme işlemi
  const refreshToken = (e) => {
    e.preventDefault();
    fetch(baseUrl + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin // Dinamik origin
      },
      body: JSON.stringify({ username: refreshFormData.username, password: refreshFormData.password }),
      mode: 'cors',
      credentials: 'include'
    })
      .then((rsp) => {
        if (!rsp.ok) {
          throw new Error("Token refresh failed");
        }
        return rsp.json();
      })
      .then((rsp) => {
        setJwt(rsp?.response?.token);
        setSavedCredentials({
          username: refreshFormData.username,
          password: refreshFormData.password,
        });
        console.log("Token refreshed successfully");
      })
      .catch((err) => console.log("Token refresh error:", err));
  };

  // Form değişikliklerini işleme
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Token yenileme form değişikliklerini işleme
  const handleRefreshChange = (e) => {
    const { name, value } = e.target;
    setRefreshFormData((prev) => ({ ...prev, [name]: value }));
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
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => setShowRefreshForm(!showRefreshForm)}
        >
          {showRefreshForm ? "Hide Refresh Token Form" : "Show Refresh Token Form"}
        </button>
      </form>

      {/* Token yenileme formu */}
      {showRefreshForm && (
        <form onSubmit={refreshToken} className="mb-5">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Username"
                value={refreshFormData.username}
                onChange={handleRefreshChange}
                defaultValue={savedCredentials.username}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={refreshFormData.password}
                onChange={handleRefreshChange}
                defaultValue={savedCredentials.password}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary mt-3">
            Refresh Token
          </button>
        </form>
      )}

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
                <td>{item.Type}</td>
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
