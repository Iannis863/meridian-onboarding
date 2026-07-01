import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5077/api';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  mondayLocation: string;
  tuesdayLocation: string;
  wednesdayLocation: string;
  thursdayLocation: string;
  fridayLocation: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'IT' | 'HR' | 'Team' | 'General';
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Active Tab: 'schedule' | 'locator' | 'checklist'
  const [activeTab, setActiveTab] = useState<'schedule' | 'locator' | 'checklist'>('schedule');

  // Locator Day filter (defaults to current weekday, fallback to Monday)
  const [locatorDay, setLocatorDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(currentDay)
      ? currentDay
      : 'Monday';
  });

  // Modal Editing State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editSchedule, setEditSchedule] = useState({
    mondayLocation: 'Office',
    tuesdayLocation: 'Office',
    wednesdayLocation: 'Office',
    thursdayLocation: 'Remote',
    fridayLocation: 'Remote',
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Onboarding Checklist state (persisted to localStorage)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('meridian_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to default
      }
    }
    return [
      { id: '1', text: 'Set up your profile and join the #general Slack channel', completed: false, category: 'General' },
      { id: '2', text: 'Schedule and complete your 1-on-1 welcome sync with HR', completed: false, category: 'HR' },
      { id: '3', text: 'Complete IT setup (GitHub access, local development environment)', completed: false, category: 'IT' },
      { id: '4', text: 'Coordinate introduction calls with department heads', completed: false, category: 'Team' },
      { id: '5', text: 'Review team hybrid calendar and set your first 3 in-office days', completed: false, category: 'General' },
      { id: '6', text: 'Review the Meridian Project overview documentation', completed: false, category: 'General' },
      { id: '7', text: 'Set up your credentials and local SQLite database context', completed: false, category: 'IT' },
    ];
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/employees`);
      if (!response.ok) {
        throw new Error(`Failed to load employees (Status ${response.status})`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Save checklist state to localStorage
  useEffect(() => {
    localStorage.setItem('meridian_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Handle Checklist toggle
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Departments list dynamically retrieved from employees
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return ['All', ...Array.from(depts)];
  }, [employees]);

  // Filtered employees for the main list
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || e.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  // Categorized locations for Selected Day
  const locatorData = useMemo(() => {
    const officeList: Employee[] = [];
    const remoteList: Employee[] = [];

    employees.forEach(e => {
      // Normalize day property key
      const key = `${locatorDay.toLowerCase()}Location` as keyof Employee;
      const val = e[key] as string;

      if (val && val.toLowerCase() === 'office') {
        officeList.push(e);
      } else {
        remoteList.push(e);
      }
    });

    return { officeList, remoteList };
  }, [employees, locatorDay]);

  // Open Edit Modal
  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditSchedule({
      mondayLocation: employee.mondayLocation,
      tuesdayLocation: employee.tuesdayLocation,
      wednesdayLocation: employee.wednesdayLocation,
      thursdayLocation: employee.thursdayLocation,
      fridayLocation: employee.fridayLocation,
    });
    setSaveError(null);
  };

  // Close Modal
  const handleCloseEdit = () => {
    setEditingEmployee(null);
    setSaveError(null);
  };

  // Update schedule day option locally in modal
  const handleToggleDay = (day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', location: 'Office' | 'Remote') => {
    setEditSchedule(prev => ({
      ...prev,
      [`${day}Location`]: location,
    }));
  };

  // Validate hybrid constraint in UI
  const scheduleValidation = useMemo(() => {
    const locations = Object.values(editSchedule);
    const officeCount = locations.filter(l => l.toLowerCase() === 'office').length;
    const remoteCount = locations.filter(l => l.toLowerCase() === 'remote').length;
    const isValid = officeCount === 3 && remoteCount === 2;

    return {
      officeCount,
      remoteCount,
      isValid,
    };
  }, [editSchedule]);

  // Submit updated schedule to backend
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !scheduleValidation.isValid) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`${API_BASE}/employees/${editingEmployee.id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editSchedule),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update schedule (Status ${response.status})`);
      }

      const updatedEmployee = await response.json();
      
      // Update state locally
      setEmployees(prev =>
        prev.map(emp => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
      );

      handleCloseEdit();
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving the schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  // Percentage checklist completion
  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }, [checklist]);

  return (
    <div className="meridian-app">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-dot"></div>
          <h1>Meridian</h1>
          <span className="badge-pill">Onboarding Portal</span>
        </div>
        <p className="subtitle">
          Welcome to the team! Navigate your first month, coordinate hybrid schedules, and locate colleagues.
        </p>
      </header>

      {/* Dashboard Top Stats Cards */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{employees.length || '--'}</h3>
            <p>Active Team Members</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>3 Office / 2 Remote</h3>
            <p>Meridian Work Policy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{checklistProgress}%</h3>
            <p>Your Onboarding Progress</p>
          </div>
        </div>
      </section>

      {/* Main Content Tabs Selection */}
      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" className="btn-icon">
            <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          Weekly Schedule Matrix
        </button>
        <button
          className={`tab-btn ${activeTab === 'locator' ? 'active' : ''}`}
          onClick={() => setActiveTab('locator')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" className="btn-icon">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Daily Office Locator
        </button>
        <button
          className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" className="btn-icon">
            <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          Onboarding Checklist
          {checklistProgress < 100 && <span className="tab-badge">New</span>}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tab-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading database information...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-msg">{error}</p>
            <button className="btn-primary" onClick={fetchEmployees}>Try Again</button>
          </div>
        ) : (
          <>
            {/* TAB 1: SCHEDULE MATRIX */}
            {activeTab === 'schedule' && (
              <div className="schedule-tab">
                {/* Search and Filters */}
                <div className="filters-bar">
                  <div className="search-wrapper">
                    <svg viewBox="0 0 24 24" width="18" height="18" className="search-icon">
                      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search colleagues by name or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="dept-filter">
                    <label>Department:</label>
                    <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Table */}
                <div className="table-responsive">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                          <tr key={emp.id} className="employee-row">
                            <td>
                              <div className="emp-identity">
                                <div className="emp-avatar">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="emp-details">
                                  <span className="emp-name">{emp.name}</span>
                                  <span className="emp-email">{emp.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="dept-tag">{emp.department}</span>
                            </td>
                            <td><span className={`loc-badge ${emp.mondayLocation.toLowerCase()}`}>{emp.mondayLocation}</span></td>
                            <td><span className={`loc-badge ${emp.tuesdayLocation.toLowerCase()}`}>{emp.tuesdayLocation}</span></td>
                            <td><span className={`loc-badge ${emp.wednesdayLocation.toLowerCase()}`}>{emp.wednesdayLocation}</span></td>
                            <td><span className={`loc-badge ${emp.thursdayLocation.toLowerCase()}`}>{emp.thursdayLocation}</span></td>
                            <td><span className={`loc-badge ${emp.fridayLocation.toLowerCase()}`}>{emp.fridayLocation}</span></td>
                            <td className="text-center">
                              <button className="btn-edit" onClick={() => handleOpenEdit(emp)}>
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                  <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="empty-results">
                            No employees found matching the filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: DAILY OFFICE LOCATOR */}
            {activeTab === 'locator' && (
              <div className="locator-tab">
                {/* Day selector buttons */}
                <div className="day-selector">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <button
                      key={day}
                      className={`day-btn ${locatorDay === day ? 'active' : ''}`}
                      onClick={() => setLocatorDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="locator-columns">
                  {/* Column 1: In the Office */}
                  <div className="locator-column office-column">
                    <div className="column-header">
                      <h2>🏢 In the Office ({locatorData.officeList.length})</h2>
                      <p>Expected present for collaboration</p>
                    </div>
                    <div className="column-cards">
                      {locatorData.officeList.length > 0 ? (
                        locatorData.officeList.map(emp => (
                          <div key={emp.id} className="locator-card office-card">
                            <div className="emp-avatar small">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="card-info">
                              <h4>{emp.name}</h4>
                              <p>{emp.department} • {emp.email}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-column-state">No one is scheduled in the office on this day.</div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Remote */}
                  <div className="locator-column remote-column">
                    <div className="column-header">
                      <h2>🏠 Working Remotely ({locatorData.remoteList.length})</h2>
                      <p>Available on Slack / Google Meet</p>
                    </div>
                    <div className="column-cards">
                      {locatorData.remoteList.length > 0 ? (
                        locatorData.remoteList.map(emp => (
                          <div key={emp.id} className="locator-card remote-card">
                            <div className="emp-avatar small">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="card-info">
                              <h4>{emp.name}</h4>
                              <p>{emp.department} • {emp.email}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-column-state">No one is scheduled remote on this day.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ONBOARDING CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="checklist-tab">
                <div className="progress-banner">
                  <div className="progress-info">
                    <h2>Onboarding Journey</h2>
                    <p>Track your onboarding tasks to ensure a smooth transition during your first month.</p>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${checklistProgress}%` }}></div>
                    <span className="progress-percentage">{checklistProgress}% Completed</span>
                  </div>
                </div>

                <div className="checklist-items">
                  {checklist.map(item => (
                    <div
                      key={item.id}
                      className={`checklist-item ${item.completed ? 'completed' : ''}`}
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      <div className="checkbox">
                        {item.completed && (
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="none" stroke="currentColor" strokeWidth="3" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                          </svg>
                        )}
                      </div>
                      <div className="checklist-details">
                        <p className="checklist-text">{item.text}</p>
                        <span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingEmployee && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Weekly Schedule</h2>
              <button className="close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveSchedule}>
              <div className="modal-body">
                <div className="employee-summary">
                  <div className="emp-avatar large">
                    {editingEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="summary-text">
                    <h3>{editingEmployee.name}</h3>
                    <p>{editingEmployee.department} • {editingEmployee.email}</p>
                  </div>
                </div>

                {/* Policy Alert Context */}
                <div className={`policy-validator ${scheduleValidation.isValid ? 'valid' : 'invalid'}`}>
                  <div className="validation-header">
                    <span className="validation-icon">
                      {scheduleValidation.isValid ? '✓' : '⚠️'}
                    </span>
                    <h4>Hybrid Schedule Requirements</h4>
                  </div>
                  <p>Must contain exactly <strong>3 Office days</strong> and <strong>2 Remote days</strong>.</p>
                  <div className="counts-badges">
                    <span className={`count-badge office ${scheduleValidation.officeCount === 3 ? 'match' : ''}`}>
                      Office: {scheduleValidation.officeCount} / 3 days
                    </span>
                    <span className={`count-badge remote ${scheduleValidation.remoteCount === 2 ? 'match' : ''}`}>
                      Remote: {scheduleValidation.remoteCount} / 2 days
                    </span>
                  </div>
                </div>

                {saveError && (
                  <div className="form-error-alert">
                    <p>Error: {saveError}</p>
                  </div>
                )}

                {/* Day Selection Fields */}
                <div className="days-setup">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map(day => {
                    const currentLoc = editSchedule[`${day}Location` as keyof typeof editSchedule];
                    return (
                      <div key={day} className="day-control-row">
                        <span className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <div className="toggle-group">
                          <button
                            type="button"
                            className={`toggle-btn office ${currentLoc === 'Office' ? 'selected' : ''}`}
                            onClick={() => handleToggleDay(day, 'Office')}
                          >
                            Office
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn remote ${currentLoc === 'Remote' ? 'selected' : ''}`}
                            onClick={() => handleToggleDay(day, 'Remote')}
                          >
                            Remote
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseEdit}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!scheduleValidation.isValid || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
