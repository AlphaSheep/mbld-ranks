import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faTrophy, faUser, faChartLine, faArrowDown19 } from "@fortawesome/free-solid-svg-icons";

import "./navbar.less";

export default function Navbar () {
  return <>
    <nav>
      <ul>
        <li>
          <a href="/"><FontAwesomeIcon icon={faHome} /></a>
          <div className="tooltip">Home</div>
        </li>
        <li>
          <a href="/person"><FontAwesomeIcon icon={faUser} /></a>
          <div className="tooltip">Person</div>
        </li>
        <li>
          <a href="/competition"><FontAwesomeIcon icon={faTrophy} /></a>
          <div className="tooltip">Competition</div>
        </li>
        <li>
          <a href="/rankings"><FontAwesomeIcon icon={faArrowDown19} /></a>
          <div className="tooltip">Rankings</div>
        </li>
        <li>
          <a href="/records"><FontAwesomeIcon icon={faChartLine} /></a>
          <div className="tooltip">Record History</div>
        </li>
      </ul>
    </nav>
  </>;
};