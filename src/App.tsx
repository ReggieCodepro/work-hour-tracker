import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { ManualEntryForm } from './components/ManualEntryForm';
import { EditLogModal } from './components/EditLogModal';

// Define the structure of a work log entry
interface WorkLog {
  startTime: number;
  endTime: number;
  duration: number;
  companyName: string; // Added field
  employeeName: string; // Added field
  hourlyRate: number; // Added field
}

function App() {
  const [isTiming, setIsTiming] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStartTime, setCurrentStartTime] = useState(0);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [companyName, setCompanyName] = useState(''); // New state
  const [employeeName, setEmployeeName] = useState(''); // New state
  const [timerHourlyRate, setTimerHourlyRate] = useState(0);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load logs from localStorage on initial render
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('workLogs');
      if (storedLogs) {
        setWorkLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error("Failed to load work logs from localStorage", error);
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('workLogs', JSON.stringify(workLogs));
    } catch (error) {
      console.error("Failed to save work logs to localStorage", error);
    }
  }, [workLogs]);

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    if (isTiming) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - currentStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming, currentStartTime]);

  const handleStartStop = () => {
    if (isTiming) {
      // Stopping the timer
      const endTime = Date.now();
      const newLog: WorkLog = {
        startTime: currentStartTime,
        endTime: endTime,
        duration: Math.floor((endTime - currentStartTime) / 1000),
        companyName: companyName, // Include new fields
        employeeName: employeeName, // Include new fields
        hourlyRate: timerHourlyRate,
      };
      setWorkLogs([newLog, ...workLogs]);
    } else {
      // Starting the timer
      setCurrentStartTime(Date.now());
      setElapsedTime(0);
    }
    setIsTiming(!isTiming);
  };
  
  const addManualLog = ({ startTime, endTime, hourlyRate }: { startTime: number; endTime: number; hourlyRate: number }) => {
    const newLog: WorkLog = {
      startTime,
      endTime,
      duration: Math.floor((endTime - startTime) / 1000),
      companyName: companyName, // Include new fields
      employeeName: employeeName, // Include new fields
      hourlyRate: hourlyRate,
    };
    setWorkLogs([...workLogs, newLog]);
  };

  const handleDeleteLog = (logId: number) => {
    setWorkLogs(workLogs.filter(log => log.startTime !== logId));
  };

  const handleEditLog = (logId: number) => {
    const logToEdit = workLogs.find(log => log.startTime === logId);
    if (logToEdit) {
      setEditingLog(logToEdit);
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingLog(null);
  };

  const handleUpdateLog = (updatedLog: WorkLog) => {
    setWorkLogs(workLogs.map(log => 
      log.startTime === updatedLog.startTime ? updatedLog : log
    ));
    handleCloseEditModal();
  };



  const handleExportLogs = () => {
    const header = ['Company', 'Employee', 'Date', 'Start Time', 'End Time', 'Duration (seconds)', 'Duration (HH:MM)'];
    const rows = sortedWorkLogs.map(log => [
      `"${log.companyName.replace(/"/g, '""')}"`, // Handle commas and quotes in CSV
      `"${log.employeeName.replace(/"/g, '""')}"`,
      `"${formatDate(log.startTime).split(',')[0]}"`,
      `"${formatDate(log.startTime).split(',')[1].trim()}"`,
      `"${formatDate(log.endTime).split(',')[1].trim()}"`,
      log.duration,
      `"${formatTime(log.duration)}"`
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `work_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const sortedWorkLogs = useMemo(() => {
    return [...workLogs].sort((a, b) => b.startTime - a.startTime);
  }, [workLogs]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  const calculatePay = (duration: number, rate: number) => {
    const hours = duration / 3600;
    return (hours * rate).toFixed(2);
  };


  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow mb-4 name-input-card">
        <div className="card-header">
          <h2>Details</h2>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="companyName" className="form-label">Company Name</label>
              <input
                type="text"
                id="companyName"
                className="form-control"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="employeeName" className="form-label">Employee Name</label>
              <input
                type="text"
                id="employeeName"
                className="form-control"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card text-center shadow timer-card">
        <div className="card-header">
          <h1>Work Hour Tracker</h1>
        </div>
        <div className="card-body">
          <h2 className="display-3">{formatTime(elapsedTime)}</h2>
          <div className="d-flex justify-content-center align-items-center">
            <div className="me-3">
              <label htmlFor="timerHourlyRate" className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                id="timerHourlyRate"
                className="form-control"
                value={timerHourlyRate}
                onChange={(e) => setTimerHourlyRate(parseFloat(e.target.value))}
                placeholder="e.g., 25"
                disabled={isTiming}
              />
            </div>
            <button
              className={`btn btn-lg ${isTiming ? 'btn-danger' : 'btn-success'}`}
              onClick={handleStartStop}
            >
              {isTiming ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      <div className="manual-entry-card">
        <ManualEntryForm onAddLog={addManualLog} />
      </div>

      <div className="card mt-4 shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Work Log</h2>
          {sortedWorkLogs.length > 0 && (
            <div className="print-reset-buttons">
              <button 
                className="btn btn-info btn-sm me-2"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button 
                className="btn btn-primary btn-sm" // Changed to btn-primary for save
                onClick={handleExportLogs}
              >
                Save CSV
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          {sortedWorkLogs.length > 0 ? (
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Date</th>
                  <th scope="col">Start Time</th>
                  <th scope="col">End Time</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Hourly Rate</th>
                  <th scope="col">Pay</th>
                  <th scope="col" className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedWorkLogs.map((log) => (
                  <tr key={log.startTime}>
                    <td>{log.companyName}</td>
                    <td>{log.employeeName}</td>
                    <td>{formatDate(log.startTime).split(',')[0]}</td>
                    <td>{formatDate(log.startTime).split(',')[1]}</td>
                    <td>{formatDate(log.endTime).split(',')[1]}</td>
                    <td>{formatDuration(log.duration)}</td>
                    <td>${log.hourlyRate.toFixed(2)}</td>
                    <td>${calculatePay(log.duration, log.hourlyRate)}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditLog(log.startTime)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteLog(log.startTime)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7} className="text-end"><strong>Total Pay:</strong></td>
                  <td colSpan={2}>
                    <strong>
                      ${sortedWorkLogs.reduce((acc, log) => acc + parseFloat(calculatePay(log.duration, log.hourlyRate)), 0).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-center">No work logs yet. Start the timer or add a manual entry!</p>
          )}
        </div>
      </div>

      <EditLogModal
        show={showEditModal}
        onClose={handleCloseEditModal}
        log={editingLog}
        onSave={handleUpdateLog}
      />
    </div>
  );
}

export default App;