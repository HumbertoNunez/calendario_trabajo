import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkEntry {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  is_rest_day: boolean;
  user_id?: string;
  notes?: string; // Added notes field
}

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateKey: string, entry: { id?: string, start?: string, end?: string, hours?: number, isRestDay?: boolean, notes?: string }) => void;
  selectedDay: Date | null;
  initialEntry: WorkEntry | null;
}

const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSave, selectedDay, initialEntry }) => {
  const [startTime, setStartTime] = useState(initialEntry?.start_time || '');
  const [endTime, setEndTime] = useState(initialEntry?.end_time || '');
  const [isRestDay, setIsRestDay] = useState(initialEntry?.is_rest_day || false);
  const [notes, setNotes] = useState(initialEntry?.notes || ''); // New state for notes
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedDay) {
      setStartTime(initialEntry?.start_time || '');
      setEndTime(initialEntry?.end_time || '');
      setIsRestDay(initialEntry?.is_rest_day || false);
      setNotes(initialEntry?.notes || ''); // Initialize notes
      setStartTimeError(null); // Clear errors on modal open
      setEndTimeError(null); // Clear errors on modal open
    }
  }, [isOpen, selectedDay, initialEntry]);

  if (!isOpen || !selectedDay) {
    return null;
  }

  const handleSave = () => {
    setStartTimeError(null); // Clear previous errors
    setEndTimeError(null); // Clear previous errors

    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    if (isRestDay) {
      onSave(dateKey, { id: initialEntry?.id, isRestDay: true, hours: 0, notes: notes }); // Include notes
    } else {
      if (!startTime) {
        setStartTimeError('La hora de entrada es requerida.');
        return;
      }
      if (!endTime) {
        setEndTimeError('La hora de salida es requerida.');
        return;
      }

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timeRegex.test(startTime)) {
        setStartTimeError('Formato HH:mm inválido.');
        return;
      }
      if (!timeRegex.test(endTime)) {
        setEndTimeError('Formato HH:mm inválido.');
        return;
      }

      let startDateTime = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), startHour, startMinute);
      let endDateTime = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), endHour, endMinute);

      // Handle overnight shifts
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const calculatedHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

      if (calculatedHours <= 0) {
        setEndTimeError('La hora de salida debe ser posterior a la hora de entrada.');
        return;
      }

      onSave(dateKey, { id: initialEntry?.id, start: startTime, end: endTime, hours: calculatedHours, isRestDay: false, notes: notes }); // Include notes
    }
    onClose();
  };

  const handleDelete = () => {
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    onSave(dateKey, { id: initialEntry?.id }); // Pass the ID to signal deletion
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Registrar Horas para {format(selectedDay, "d 'de' MMMM yyyy", { locale: es })}</h3>
        <div className="form-group">
          <label htmlFor="startTime">Hora de Entrada:</label>
          <input
            type="text"
            id="startTime"
            className="form-control"
            value={startTime}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, ''); // Keep only digits
              if (value.length > 2) {
                value = value.substring(0, 2) + ':' + value.substring(2);
              }
              if (value.length > 5) {
                value = value.substring(0, 5);
              }
              setStartTime(value);
            }}
            disabled={isRestDay}
            placeholder="HH:mm"
            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
            title="Formato HH:mm (ej. 09:00 o 17:30)"
          />
          {startTimeError && <p className="error-message">{startTimeError}</p>}
        </div>
        <div className="form-group mt-3">
          <label htmlFor="endTime">Hora de Salida:</label>
          <input
            type="text"
            id="endTime"
            className="form-control"
            value={endTime}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, ''); // Keep only digits
              if (value.length > 2) {
                value = value.substring(0, 2) + ':' + value.substring(2);
              }
              if (value.length > 5) {
                value = value.substring(0, 5);
              }
              setEndTime(value);
            }}
            disabled={isRestDay}
            placeholder="HH:mm"
            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
            title="Formato HH:mm (ej. 09:00 o 17:30)"
          />
          {endTimeError && <p className="error-message">{endTimeError}</p>}
        </div>
        <div className="form-group mt-3">
          <label htmlFor="notes">Notas:</label>
          <textarea
            id="notes"
            className="form-control"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Añade notas sobre tu jornada..."
          ></textarea>
        </div>
        <div className="form-check mt-3">
          <input
            type="checkbox"
            id="isRestDay"
            className="form-check-input"
            checked={isRestDay}
            onChange={(e) => setIsRestDay(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="isRestDay">Día de Descanso</label>
        </div>
        <div className="modal-actions mt-4">
          <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
          <button className="btn btn-danger ms-2" onClick={handleDelete}>Borrar</button>
          <button className="btn btn-secondary ms-2" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;
