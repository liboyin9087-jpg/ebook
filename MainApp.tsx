import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Reader } from './components/Reader/Reader';

const MainApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book/:id" element={<Reader />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainApp;
