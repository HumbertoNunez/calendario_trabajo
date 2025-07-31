import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import EntryModal from './EntryModal'; // Import the EntryModal component
import { Toaster, toast } from 'react-hot-toast';
import useLocalStorage from '../hooks/useLocalStorage';
import { supabase } from '../supabaseClient';

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

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workHours, setWorkHours] = useState<{ [key: string]: WorkEntry }>({});
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);
  const [initialEntryForModal, setInitialEntryForModal] = useState<WorkEntry | null>(null);

  // Apply theme to body whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchWorkEntries = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('work_entries')
          .select('id, date, start_time, end_time, hours, is_rest_day, notes') // Include notes
          .eq('user_id', user.id);

        if (error) {
          toast.error(error.message);
        } else if (data) {
          const formattedData: { [key: string]: WorkEntry } = {};
          data.forEach(entry => {
            formattedData[entry.date] = { ...entry, hours: parseFloat(entry.hours.toString()) }; // Ensure hours is parsed correctly
          });
          setWorkHours(formattedData);
        }
      } else {
        setWorkHours({}); // Clear data if no user is logged in
      }
      setLoading(false);
    };

    fetchWorkEntries();
  }, [currentDate]); // Re-fetch when month changes

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

  const exportData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para exportar datos.");
      return;
    }

    const { data, error } = await supabase
      .from('work_entries')
      .select('date, start_time, end_time, hours, is_rest_day, notes') // Include notes
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      toast.error(error.message);
      return;
    }

    const headers = ["Fecha", "Hora Entrada", "Hora Salida", "Horas Trabajadas", "Día de Descanso", "Notas", "Número de Semana"]; // Added Notes header
    const rows = data.map(entry => {
      const day = new Date(entry.date); // Convert dateKey back to Date object
      const weekNumber = getWeek(day, { weekStartsOn: 1 });
      return [
        entry.date,
        entry.start_time || "",
        entry.end_time || "",
        entry.hours !== undefined ? entry.hours.toFixed(2) : "",
        entry.is_rest_day ? "Sí" : "No",
        entry.notes || "", // Include notes
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

  const clearAllData = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar TODOS tus datos de trabajo? Esta acción no se puede deshacer.")) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para eliminar datos.");
      return;
    }

    const { error } = await supabase
      .from('work_entries')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      setWorkHours({}); // Clear local state
      toast.success('Todos tus datos de trabajo han sido eliminados.');
    }
  };

  // Function to handle data saved from the modal
  const handleModalSave = async (dateKey: string, entry: { start?: string, end?: string, hours?: number, isRestDay?: boolean, id?: string, notes?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para guardar datos.");
      return;
    }

    const entryToSave = {
      date: dateKey,
      start_time: entry.start || '',
      end_time: entry.end || '',
      hours: entry.hours || 0,
      is_rest_day: entry.isRestDay || false,
      user_id: user.id,
      notes: entry.notes || '', // Include notes
    };

    if (Object.keys(entry).length === 0) { // Check if entry is empty, signaling deletion
      if (entry.id) {
        const { error } = await supabase
          .from('work_entries')
          .delete()
          .eq('id', entry.id);

        if (error) {
          toast.error(error.message);
        } else {
          setWorkHours(prev => {
            const newWorkHours = { ...prev };
            delete newWorkHours[dateKey];
            return newWorkHours;
          });
          toast.error('Entrada eliminada');
        }
      }
    } else if (entry.id) { // Update existing entry
      const { error } = await supabase
        .from('work_entries')
        .update(entryToSave)
        .eq('id', entry.id);

      if (error) {
        toast.error(error.message);
      } else {
        setWorkHours(prev => ({
          ...prev,
          [dateKey]: { ...entryToSave, id: entry.id },
        }));
        toast.success('Entrada actualizada con éxito');
      }
    } else { // Insert new entry
      const { data, error } = await supabase
        .from('work_entries')
        .insert([entryToSave])
        .select();

      if (error) {
        toast.error(error.message);
      } else if (data && data.length > 0) {
        setWorkHours(prev => ({
          ...prev,
          [dateKey]: { ...entryToSave, id: data[0].id },
        }));
        toast.success('Entrada guardada con éxito');
      }
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
      if (entry.is_rest_day) {
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
        <button className="btn btn-outline-danger ms-2" onClick={clearAllData}>
          Limpiar Todos los Datos
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
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">Cargando datos...</td>
              </tr>
            ) : (
              Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => {
                const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
                let weeklyHours = 0;
                let weeklyDaysWorked = 0;

                weekDays.forEach(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const entry = workHours[dateKey];
                  if (entry && entry.hours !== undefined && !entry.is_rest_day) {
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
                            className={`${!isSameMonth(day, monthStart) ? 'text-muted' : ''} ${isToday(day) ? 'is-today' : ''} ${entry?.is_rest_day ? 'bg-info text-white' : ''}`}
                            onClick={() => handleDayClick(day)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="day-number">{format(day, 'd')}</div>
                            {entry?.is_rest_day && (
                              <span className="badge bg-secondary mt-1">Día de Descanso</span>
                            )}
                            {entry?.hours !== undefined && !entry?.is_rest_day && (
                              <div>
                                {entry.start_time && entry.end_time && (
                                  <span style={{ color: 'var(--time-range-text-color)', marginRight: '0.25rem' }}>{entry.start_time} - {entry.end_time}</span>
                                )}
                                <div className="mt-1"> {/* Add a div for the new line and some margin-top */}
                                  <span className="badge bg-success">{formatHours(entry.hours)}</span>
                                </div>
                                {entry.notes && (
                                  <div className="text-muted" style={{ fontSize: '0.75em' }}>{entry.notes}</div>
                                )}
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
              })
            )}
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
