import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import VehicleQuoteForm from './components/VehicleQuoteForm';
import VehicleQuoteEditForm from './components/VehicleQuoteEditForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VehicleQuoteForm />} />
        <Route path="/edit-form/:uniqueId" element={<VehicleQuoteEditForm />} />
      </Routes>
    </Router>
  );
}

export default App;
