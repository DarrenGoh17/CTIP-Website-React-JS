import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../backend/config';

export default function IoTDashboard() {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/sensor-readings`);
        setSensorData(response.data);
      } catch (error) {
        console.error('Error fetching sensor readings:', error);
      }
    };

    // Initial fetch
    fetchSensorData();

    // Set up interval to auto-refresh data
    const intervalId = setInterval(fetchSensorData, 5000); // Fetch data every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="iot-dashboard-container">
      <h2 className="iot-dashboard-title">Sensor Readings</h2>
      <div className="iot-dashboard-table">
        {/* Table Header */}
        <div className="iot-dashboard-table-row iot-dashboard-header-row">
          <div className="iot-dashboard-table-header iot-dashboard-table-cell">ID</div>
          <div className="iot-dashboard-table-header iot-dashboard-table-cell">Timestamp</div>
          <div className="iot-dashboard-table-header iot-dashboard-table-cell">Motion Status</div>
          <div className="iot-dashboard-table-header iot-dashboard-table-cell">Sound Value</div>
          <div className="iot-dashboard-table-header iot-dashboard-table-cell">Pressure Button Status</div>
        </div>

        {/* Table Rows */}
        {sensorData
          .slice()
          .reverse()
          .map((reading) => (
            <div key={reading.id} className="iot-dashboard-table-row">
              <div className="iot-dashboard-table-cell">{reading.id}</div>
              <div className="iot-dashboard-table-cell">{new Date(reading.timestamp).toLocaleString()}</div>
              <div className="iot-dashboard-table-cell">{reading.motion_status}</div>
              <div className="iot-dashboard-table-cell">{reading.sound_value}</div>
              <div className="iot-dashboard-table-cell">{reading.button_status}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
