import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { ScrollRestoration } from 'react-router-dom';
import alertService, { Alert } from '../services/alert-service';

export default function PageLayout(props: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  alertService.registerSetAlerts(alerts, setAlerts);

  return <>
    <ScrollRestoration />
    <div className="page-container">
      <Navbar/>
      <div className="alert-container">
        {alertService.getAlertComponents()}
      </div>

      <div className="page-content">
        {props.children}
      </div>
      <Footer/>
    </div>
  </>;
}