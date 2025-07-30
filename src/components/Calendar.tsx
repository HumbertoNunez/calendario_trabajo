import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, getDay, addDays, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import EntryModal from './EntryModal'; // Import the EntryModal component
import { Toaster, toast } from 'react-hot-toast';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workHours, setWorkHours] = useState<{ [key: string]: { start?: string, end?: string, hours?: number, isRestDay?: boolean } }>(() => {
    const savedWorkHours = localStorage.getItem('workHours');
    return savedWorkHours ? JSON.parse(savedWorkHours) : {};
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    } else {
      // Detect user's system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
  const [initialEntryForModal, setInitialEntryForModal] = useState<{ start?: string, end?: string, hours?: number, isRestDay?: boolean } | null>(null);

  // Save data to localStorage whenever workHours changes
  useEffect(() => {
    localStorage.setItem('workHours', JSON.stringify(workHours));
  }, [workHours]);

  // Apply theme to body and save to localStorage whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const formatHours = (totalHours: number) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const exportData = () => {
    const headers = ["Fecha", "Hora Entrada", "Hora Salida", "Horas Trabajadas", "Día de Descanso", "Número de Semana"];
    const rows = Object.keys(workHours).map(dateKey => {
      const entry = workHours[dateKey];
      const day = new Date(dateKey); // Convert dateKey back to Date object
      const weekNumber = getWeek(day, { weekStartsOn: 1 });
      return [
        dateKey,
        entry.start || "",
        entry.end || "",
        entry.hours !== undefined ? entry.hours.toFixed(2) : "",
        entry.isRestDay ? "Sí" : "No",
        weekNumber.toString(),
      ].map(item => `"${item}"`).join(","); // Enclose items in quotes to handle commas within data
    });

    const metadata = [
      `"Nombre: Humberto Israel Núñez Fonseca"`,
      `"Lugar de Trabajo: Media Pro"`
    ];

    const csvContent = [...metadata, headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'calendario_trabajo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle data saved from the modal
  const handleModalSave = (dateKey: string, entry: { start?: string, end?: string, hours?: number, isRestDay?: boolean }) => {
    if (Object.keys(entry).length === 0) { // Check if entry is empty, signaling deletion
      setWorkHours(prev => {
        const newWorkHours = { ...prev };
        delete newWorkHours[dateKey];
        toast.error('Entrada eliminada');
        return newWorkHours;
      });
    } else {
      setWorkHours(prev => ({
        ...prev,
        [dateKey]: entry,
      }));
      toast.success('Entrada guardada con éxito');
    }
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    setSelectedDayForModal(day);
    setInitialEntryForModal(workHours[dateKey] || null); // Pass existing data to modal
    setIsModalOpen(true); // Open the modal
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes como inicio de semana
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate monthly summary
  let monthlyHours = 0;
  let monthlyDaysWorked = 0;
  let monthlyRestDays = 0;

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const entry = workHours[dateKey];
    if (entry) {
      if (entry.isRestDay) {
        monthlyRestDays++;
      } else if (entry.hours !== undefined) {
        monthlyHours += entry.hours;
        monthlyDaysWorked++;
      }
    }
  });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="container mt-5">
      <Toaster />
      <p className="user-info" style={{ color: 'var(--text-color)' }}>Humberto Israel Núñez Fonseca - Media Pro</p>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={prevMonth}>&lt;</button>
        <h2 className="text-capitalize" style={{ color: 'var(--text-color)', fontWeight: 'normal' }}>{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
        <button className="btn btn-outline-primary" onClick={nextMonth}>&gt;</button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-outline-secondary ms-2" onClick={exportData}>
          Exportar Datos
        </button>
      </div>
      <div className="text-center mb-3">
        <p><strong>Resumen Mensual:</strong> Horas Trabajadas: {formatHours(monthlyHours)}, Días Trabajados: {monthlyDaysWorked}, Días de Descanso: {monthlyRestDays}</p>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              {daysOfWeek.map(day => (
                <th key={day} scope="col">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => {
              const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
              let weeklyHours = 0;
              let weeklyDaysWorked = 0;

              weekDays.forEach(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const entry = workHours[dateKey];
                if (entry && entry.hours !== undefined && !entry.isRestDay) {
                  weeklyHours += entry.hours;
                  weeklyDaysWorked++;
                }
              });

              return (
                <React.Fragment key={weekIndex}>
                  <tr>
                    {weekDays.map(day => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const entry = workHours[dateKey];
                      return (
                        <td
                          key={dateKey}
                          className={`${!isSameMonth(day, monthStart) ? 'text-muted' : ''} ${isToday(day) ? 'is-today' : ''} ${entry?.isRestDay ? 'bg-info text-white' : ''}`}
                          onClick={() => handleDayClick(day)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="day-number">{format(day, 'd')}</div>
                          {entry?.isRestDay && (
                            <span className="badge bg-secondary mt-1">Día de Descanso</span>
                          )}
                          {entry?.hours !== undefined && !entry?.isRestDay && (
                            <div>
                              {entry.start && entry.end && (
                                <span style={{ color: 'var(--time-range-text-color)', marginRight: '0.25rem' }}>{entry.start} - {entry.end}</span>
                              )}
                              <div className="mt-1"> {/* Add a div for the new line and some margin-top */}
                                <span className="badge bg-success">{formatHours(entry.hours)}</span>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="table-secondary">
                    <td colSpan={7} className="text-start">
                      <strong>Semana {getWeek(weekDays[0], { weekStartsOn: 1 })}:</strong> Horas Trabajadas: {formatHours(weeklyHours)}, Días Trabajados: {weeklyDaysWorked}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        selectedDay={selectedDayForModal}
        initialEntry={initialEntryForModal}
      />
    </div>
  );
};

export default Calendar;
