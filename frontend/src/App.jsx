import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd-mobile'
import zhCN from 'antd-mobile/es/locales/zh-CN'
import './App.css'

// 页面组件
import Home from './pages/Home'
import Login from './pages/Login'
import TechnicianList from './pages/TechnicianList'
import TechnicianDetail from './pages/TechnicianDetail'
import Booking from './pages/Booking'
import CitySelect from './pages/CitySelect'
import TechnicianDashboard from './pages/TechnicianDashboard'
import TechnicianProfileCreate from './pages/TechnicianProfileCreate'
import TechnicianProfileEdit from './pages/TechnicianProfileEdit'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/technicians" element={<TechnicianList />} />
            <Route path="/technician/:id" element={<TechnicianDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/city" element={<CitySelect />} />
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/technician/profile/create" element={<TechnicianProfileCreate />} />
            <Route path="/technician/profile/edit" element={<TechnicianProfileEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  )
}

export default App
