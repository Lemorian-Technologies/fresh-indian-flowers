'use client';

import moment from 'moment';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';



const DateRangePicker = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  async function listOrders() {
    if (!startDate || !endDate) return;

    
  
  const formattedStartDate = moment(startDate).format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = moment(endDate).format('YYYY-MM-DDTHH:mm:ss');
  
    const response = await fetch(`http://localhost:3000/api/reports?start=${formattedStartDate}&end=${formattedEndDate}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error('Failed to fetch data');
    }
  }
  const handleClick = () => {
    listOrders();
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Select Date Range</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="MM/dd/yyyy, EEEE"
            className="mt-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="MM/dd/yyyy, EEEE"
            className="mt-1 rounded-md border border-gray-300 p-2 px-4 py-2 shadow-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div className="mt-6">
          {startDate && endDate && (
            <p>
              Selected Range: {startDate.toLocaleDateString('fr-FR')} -{' '}
              {endDate.toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>{' '}
        <button
          onClick={handleClick}
          className="mt-6 w-full rounded-md bg-custom-green px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-custom-green"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
