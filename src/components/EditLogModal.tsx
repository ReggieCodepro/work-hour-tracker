import React, { useState, useEffect } from 'react';

interface WorkLog {
  startTime: number;
  endTime: number;
  duration: number;
  companyName: string;
  employeeName: string;
  hourlyRate: number;
}

interface EditLogModalProps {
  show: boolean;
  onClose: () => void;
  log: WorkLog | null;
  onSave: (updatedLog: WorkLog) => void;
}

export function EditLogModal({ show, onClose, log, onSave }: EditLogModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (log) {
      setCompanyName(log.companyName);
      setEmployeeName(log.employeeName);
      const startDate = new Date(log.startTime);
      const endDate = new Date(log.endTime);
      setDate(startDate.toISOString().split('T')[0]);
      setStartTime(startDate.toTimeString().split(' ')[0].substring(0, 5));
      setEndTime(endDate.toTimeString().split(' ')[0].substring(0, 5));
      setHourlyRate(log.hourlyRate);
    }
  }, [log]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName || !employeeName || !date || !startTime || !endTime) {
      setError('All fields are required.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time.');
      return;
    }

    if (!log) return;

    const updatedLog: WorkLog = {
      ...log,
      companyName,
      employeeName,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration: Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000),
      hourlyRate,
    };

    onSave(updatedLog);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Work Log</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="editCompanyName" className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="editCompanyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editEmployeeName" className="form-label">Employee Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="editEmployeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editDate" className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="editDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editStartTime" className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="editStartTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editEndTime" className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="editEndTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editHourlyRate" className="form-label">Hourly Rate ($)</label>
                <input
                  type="number"
                  className="form-control"
                  id="editHourlyRate"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}