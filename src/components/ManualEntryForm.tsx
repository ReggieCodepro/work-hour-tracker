import { useState } from 'react';

interface ManualEntryFormProps {
  onAddLog: (log: { startTime: number; endTime: number; hourlyRate: number }) => void;
}

export function ManualEntryForm({ onAddLog }: ManualEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) {
      setError('All fields are required.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time.');
      return;
    }

    onAddLog({
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      hourlyRate: hourlyRate,
    });

    // Reset fields
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('17:00');
    setHourlyRate(0);
  };

  return (
    <div className="card mt-4 shadow">
      <div className="card-header">
        <h2>Add Manual Entry</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row g-3 align-items-end">
            <div className="col-md">
              <label htmlFor="date" className="form-label">Date</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-md">
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input
                type="time"
                id="startTime"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="col-md">
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input
                type="time"
                id="endTime"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="col-md">
              <label htmlFor="hourlyRate" className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                id="hourlyRate"
                className="form-control"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                placeholder="e.g., 25"
              />
            </div>
            <div className="col-md-auto">
              <button type="submit" className="btn btn-primary w-100">Add Log</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
