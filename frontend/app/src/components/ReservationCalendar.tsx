import React from 'react';

interface ReservationCalendarProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
    selectedDate,
    onDateChange
}) => {
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let daysToAdd = 0;

        while (dates.length < 14) { // 2 semanas de fechas disponibles
            const date = new Date(today);
            date.setDate(today.getDate() + daysToAdd);

            // Solo añadir días de semana (Lunes-Viernes)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                dates.push(date);
            }

            daysToAdd++;
        }

        return dates;
    };

    const isSameDate = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-[#071d40] mb-4">Selecciona una fecha</h3>

            <div className="flex overflow-x-auto pb-2 space-x-2">
                {generateDates().map((date, index) => (
                    <button
                        key={index}
                        className={`flex-shrink-0 p-3 rounded-lg ${
                            isSameDate(date, selectedDate)
                                ? 'bg-[#071d40] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => onDateChange(date)}
                    >
                        <div className="text-center">
                            <p className="text-xs">
                                {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                            </p>
                            <p className="font-bold">{date.getDate()}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReservationCalendar;