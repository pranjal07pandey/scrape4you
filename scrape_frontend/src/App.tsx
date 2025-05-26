import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import VehicleQuoteForm from './components/VehicleQuoteForm';
import VehicleQuoteEditForm from './components/VehicleQuoteEditForm';
import AllQuotesListing from './components/AllQuotesListing';
import Terms from './components/TermAndCondition';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VehicleQuoteForm />} />
        <Route path="/edit-form/:uniqueId" element={<VehicleQuoteEditForm />} />
        <Route path="/list-quotes/:listingId/:agentId" element={<AllQuotesListing/>} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy/>} />

      </Routes>
    </Router>
  );
}

export default App;
