import React from "react";
import { Alert } from "../services/alert-service";

import "./alert-message.less";

export default function AlertMessage({ message, type }: Alert) {
  return <div className={`alert-message ${type}`}>
    {message}
  </div>;
}