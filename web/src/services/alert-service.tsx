import React, {useState} from "react";
import AlertMessage from "../components/alert-message";

export type Alert = {
  key?: string;
  message: string;
  type: string;
};

class AlertService {

  private _alerts: Alert[] = [];
  private _setAlerts: (alerts: Alert[]) => void;

  constructor() {
  }

  public registerSetAlerts(alerts: Alert[], setAlerts: (alerts: Alert[]) => void) {
    this._alerts = alerts;
    this._setAlerts = setAlerts;
  }

  public addAlert(alert: Alert) {
    this._setAlerts([...this._alerts, alert]);
    setTimeout(() => {
      this.removeAlert(alert);
    }, 5000);
  }

  public error(message: string) {
    if (this._alerts.find(a => (a.message === message && a.type === "error"))) {
      // Don't add the same error message twice
      return;
    }
    this.addAlert({ message, type: "error" });
  }

  public getAlerts(): Alert[] {
    return this._alerts;
  }

  public getAlertComponents(): JSX.Element[] {
    return this._alerts.map(alert =>
      <AlertMessage
        key={`${alert.type}-${alert.message}`}
        message={alert.message}
        type={alert.type}
      />);
  }

  public removeAlert(alert: Alert) {
    this._setAlerts(this._alerts.filter(a => a !== alert));
  }
}

const alertService = new AlertService();
export default alertService;