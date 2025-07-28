import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workHours, setWorkHours] = useState<{ [key: string]: number }>({});

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleDayClick = (day: Date) => {
    const hours = prompt(`Introduce las horas para ${format(day, 'd 'de' MMMM', { locale: es })}:`);
    if (hours !== null && !isNaN(Number(hours))) {
      const dateKey = format(day, 'yyyy-MM-dd');
      setWorkHours(prev => ({ ...prev, [dateKey]: Number(hours) }));
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes como inicio de semana
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={prevMonth}>&lt;</button>
        <h2 className="text-capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
        <button className="btn btn-outline-primary" onClick={nextMonth}>&gt;</button>
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
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const hours = workHours[dateKey];
                  return (
                    <td
                      key={dateKey}
                      className={`${!isSameMonth(day, monthStart) ? 'text-muted' : ''} ${isToday(day) ? 'bg-primary text-white' : ''}`}
                      onClick={() => handleDayClick(day)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>{format(day, 'd')}</div>
                      {hours !== undefined && (
                        <span className="badge bg-success mt-1">{hours}h</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Calendar;
