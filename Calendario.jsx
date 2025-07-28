import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="d-flex justify-content-between align-items-center py-2">
        <div className="col-auto">
          <button className="btn btn-outline-primary" onClick={prevMonth}>
            &lt;
          </button>
        </div>
        <div className="col-auto">
          <span className="h4 text-capitalize">
            {format(currentDate, dateFormat, { locale: es })}
          </span>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-primary" onClick={nextMonth}>
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEE";
    let startDate = startOfWeek(currentDate, { locale: es });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col-auto text-center fw-bold" key={i}>
          {format(addMonths(startDate, i), dateFormat, { locale: es }).substring(0, 3)}
        </div>
      );
    }
    return <div className="row justify-content-around">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const rows = [];
    let dayCells = [];

    days.forEach((day, i) => {
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      
      dayCells.push(
        <div
          className={`col-auto p-2 text-center border ${!isCurrentMonth ? "text-muted bg-light" : ""} ${isCurrentDay ? "bg-primary text-white rounded-circle" : ""}`}
          key={day.toString()}
          style={{width: '14%'}}
        >
          <span>{format(day, "d")}</span>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(<div className="row g-0" key={day.toString()}>{dayCells}</div>);
        dayCells = [];
      }
    });

    return <div className="container-fluid">{rows}</div>;
  };

  return (
    <div className="container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendario;03