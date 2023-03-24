import React from 'react';
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
    return (
      <div className="App">
        <div className="container mt-4">
         <Outlet />
        </div>
      </div>
        );
  }
  
export default Layout;