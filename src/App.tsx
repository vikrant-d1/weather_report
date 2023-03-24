import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import WeatherReportTable from './components/weatherReport/WeatherReportTable';
import Layout from "./components/layout/Layout";
import WeatherForm from './components/weatherForm/WeatherForm';
import ViewWeatherForm from './components/weatherForm/ViewWeatherForm';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route element={<Layout />} >
        <Route path="/" element={<WeatherForm />} />
        <Route path="reports" element={<WeatherReportTable />} />
        <Route path="/view/:id" element={<ViewWeatherForm />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
}

export default App;
