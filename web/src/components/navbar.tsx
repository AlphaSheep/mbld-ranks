import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faUser,
  faChartLine,
  faArrowDown19,
  faBars,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import "./navbar.less";

export default function Navbar() {
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(true);

  return (
    <>
      <nav>
        <div className="nav-title">
          <a href="/rankings">Alternative MBLD Ranks</a>
          <button
            className="nav-collapse-button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <FontAwesomeIcon icon={isNavCollapsed ? faBars : faTimes} />
          </button>
        </div>
        <ul className={isNavCollapsed ? "nav-links collapsed" : "nav-links"}>
          <li>
            <a href="/rankings">
              <FontAwesomeIcon icon={faArrowDown19} />
              <span className="nav-label">Rankings</span>
            </a>
          </li>
          <li>
            <a href="/records">
              <FontAwesomeIcon icon={faChartLine} />
              <span className="nav-label">Records</span>
            </a>
          </li>
          <li>
            <a href="/person">
              <FontAwesomeIcon icon={faUser} />
              <span className="nav-label">Person</span>
            </a>
          </li>
          <li>
            <a href="/competition">
              <FontAwesomeIcon icon={faTrophy} />
              <span className="nav-label">Competition</span>
            </a>
          </li>
          <li>
            <a href="/">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span className="nav-label">About</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
