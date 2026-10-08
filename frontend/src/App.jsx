import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/employees";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  salary: "",
  joiningDate: "",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const departmentStats = employees.reduce((stats, employee) => {
    const department = employee.department;

    stats[department] = (stats[department] || 0) + 1;

    return stats;
  }, {});

  const averageSalary =
    employees.length > 0
      ? employees.reduce(
          (total, employee) =>
            total + Number(employee.salary || 0),
          0
        ) / employees.length
      : 0;

  // =========================
  // NOTIFICATION
  // =========================

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        message: "",
        type: "",
      });
    }, 3000);
  };

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      console.log("Employees received:", response.data);

      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);

      showNotification(
        "Unable to fetch employees. Make sure backend is running.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================
  // FORM VALIDATION
  // =========================

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (form.name.trim().length < 2) {
      showNotification(
        "Name must contain at least 2 characters.",
        "error"
      );
      return false;
    }

    if (!emailPattern.test(form.email)) {
      showNotification(
        "Please enter a valid email address.",
        "error"
      );
      return false;
    }

    if (!phonePattern.test(form.phone)) {
      showNotification(
        "Phone number must contain exactly 10 digits.",
        "error"
      );
      return false;
    }

    if (!form.role.trim()) {
      showNotification(
        "Please enter employee role.",
        "error"
      );
      return false;
    }

    if (!form.department) {
      showNotification(
        "Please select a department.",
        "error"
      );
      return false;
    }

    if (Number(form.salary) <= 0) {
      showNotification(
        "Salary must be greater than 0.",
        "error"
      );
      return false;
    }

    if (!form.joiningDate) {
      showNotification(
        "Please select joining date.",
        "error"
      );
      return false;
    }

    return true;
  };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // =========================
  // ADD / UPDATE EMPLOYEE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, {
          ...form,
          salary: Number(form.salary),
        });

        showNotification(
          "Employee updated successfully!",
          "success"
        );
      } else {
        await axios.post(API_URL, {
          ...form,
          salary: Number(form.salary),
        });

        showNotification(
          "Employee added successfully!",
          "success"
        );
      }

      // Clear form
      setForm(initialForm);
      setEditingId(null);

      // IMPORTANT:
      // Fetch latest employees from backend
      await fetchEmployees();
    } catch (error) {
      console.error("Submit error:", error);

      showNotification(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Something went wrong.",
        "error"
      );
    }
  };

  // =========================
  // VIEW EMPLOYEE
  // =========================

  const handleView = (employee) => {
    setSelectedEmployee(employee);
  };

  // =========================
  // EDIT EMPLOYEE
  // =========================

  const handleEdit = (employee) => {
    setEditingId(employee._id);

    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      salary: employee.salary,
      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE EMPLOYEE
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);

      showNotification(
        "Employee deleted successfully!",
        "success"
      );

      await fetchEmployees();
    } catch (error) {
      console.error("Delete error:", error);

      showNotification(
        "Failed to delete employee.",
        "error"
      );
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // =========================
  // SEARCH
  // =========================

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    return (
      employee.name
        ?.toLowerCase()
        .includes(searchText) ||
      employee.email
        ?.toLowerCase()
        .includes(searchText) ||
      employee.phone
        ?.toLowerCase()
        .includes(searchText) ||
      employee.role
        ?.toLowerCase()
        .includes(searchText) ||
      employee.department
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* Notification */}
      {notification.message && (
        <div
          className={`notification ${notification.type}`}
        >
          <span>
            {notification.type === "success" ? "✓" : "!"}
          </span>

          <p>{notification.message}</p>

          <button
            onClick={() =>
              setNotification({
                message: "",
                type: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div>
          <h1>Employee Management System</h1>
          <p>Manage your employees easily</p>
        </div>
      </header>

      {/* Dashboard */}
      <section className="dashboard">

        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <p>Total Employees</p>
            <h2>{employees.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💻</div>

          <div>
            <p>IT Employees</p>

            <h2>
              {
                employees.filter(
                  (employee) =>
                    employee.department === "IT"
                ).length
              }
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>

          <div>
            <p>Departments</p>

            <h2>
              {
                new Set(
                  employees.map(
                    (employee) =>
                      employee.department
                  )
                ).size
              }
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>

          <div>
            <p>Total Salary</p>

            <h2>
              ₹
              {employees
                .reduce(
                  (total, employee) =>
                    total +
                    Number(employee.salary || 0),
                  0
                )
                .toLocaleString()}
            </h2>
          </div>
        </div>

      </section>

      {/* Analytics */}
      <section className="analytics-section">

        <div className="analytics-card">

          <div className="analytics-header">
            <h3>Average Salary</h3>
            <span>💰</span>
          </div>

          <div className="analytics-value">
            ₹{Math.round(averageSalary).toLocaleString()}
          </div>

          <p>Average salary per employee</p>

        </div>

        <div className="analytics-card department-card">

          <div className="analytics-header">
            <h3>Department Overview</h3>
            <span>📊</span>
          </div>

          {Object.keys(departmentStats).length === 0 ? (
            <p className="no-data">
              No department data available
            </p>
          ) : (
            <div className="department-list">

              {Object.entries(departmentStats).map(
                ([department, count]) => (
                  <div
                    className="department-row"
                    key={department}
                  >

                    <div>
                      <strong>{department}</strong>

                      <span>
                        {count} employee
                        {count > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="department-count">
                      {count}
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </section>

      <main className="container">

        {/* Add / Update Form */}
        <section className="card">

          <div className="section-title">

            <h2>
              {editingId
                ? "Update Employee"
                : "Add Employee"}
            </h2>

            {editingId && (
              <button
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength="2"
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10 digit phone number"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  name="role"
                  placeholder="e.g. Software Developer"
                  value={form.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Department
                  </option>

                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">
                    Finance
                  </option>
                  <option value="Marketing">
                    Marketing
                  </option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">
                    Operations
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Salary</label>

                <input
                  type="number"
                  name="salary"
                  placeholder="Enter salary"
                  min="1"
                  value={form.salary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Joining Date</label>

                <input
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button
              className="submit-btn"
              type="submit"
            >
              {editingId
                ? "Update Employee"
                : "Add Employee"}
            </button>

          </form>

        </section>

        {/* Employee List */}
        <section className="card">

          <div className="list-header">

            <div>
              <h2>Employee List</h2>

              <p>
                {employees.length} employee(s) found
              </p>
            </div>

            <input
              className="search-box"
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          {loading ? (
            <div className="message">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="message">
              {search
                ? "No employee found."
                : "No employees added yet."}
            </div>
          ) : (
            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Joining Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredEmployees.map(
                    (employee) => (
                      <tr
                        key={employee._id}
                      >

                        <td>{employee.name}</td>

                        <td>{employee.email}</td>

                        <td>{employee.phone}</td>

                        <td>{employee.role}</td>

                        <td>
                          <span className="department">
                            {employee.department}
                          </span>
                        </td>

                        <td>
                          ₹
                          {Number(
                            employee.salary
                          ).toLocaleString()}
                        </td>

                        <td>
                          {new Date(
                            employee.joiningDate
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td>

                          <div className="actions">

                            <button
                              className="view-btn"
                              onClick={() =>
                                handleView(
                                  employee
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  employee
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  employee._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Employee Details Modal */}
        {selectedEmployee && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedEmployee(null)
            }
          >

            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>Employee Details</h2>
                  <p>
                    Complete employee information
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setSelectedEmployee(null)
                  }
                >
                  ×
                </button>

              </div>

              <div className="employee-profile">

                <div className="profile-avatar">
                  {selectedEmployee.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {selectedEmployee.name}
                  </h3>

                  <p>
                    {selectedEmployee.role}
                  </p>
                </div>

              </div>

              <div className="details-grid">

                <div className="detail-item">
                  <span>Email</span>
                  <strong>
                    {selectedEmployee.email}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Phone</span>
                  <strong>
                    {selectedEmployee.phone}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Department</span>
                  <strong>
                    {selectedEmployee.department}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Salary</span>
                  <strong>
                    ₹
                    {Number(
                      selectedEmployee.salary
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Joining Date</span>

                  <strong>
                    {new Date(
                      selectedEmployee.joiningDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Employee ID</span>

                  <strong>
                    {selectedEmployee._id}
                  </strong>
                </div>

              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedEmployee(null)
                }
              >
                Close
              </button>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default App;