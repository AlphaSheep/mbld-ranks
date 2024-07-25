import React from "react";
import PageLayout from "../layouts/page-layout";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faUser,
  faChartLine,
  faArrowDown19,
} from "@fortawesome/free-solid-svg-icons";
import About from "../components/about";

export default function HomePage() {
  return (
    <PageLayout>
      <h1>About</h1>

      <p className="prose">
        This is an unofficial alternative ranking system for the multiple
        blindfolded event. Results are based on those of the{" "}
        <a
          href="https://www.worldcubeassociation.org/"
          target="_blank"
          rel="noreferrer"
        >
          World Cube Association
        </a>
        .
      </p>

      <ul className="link-list">
        <li>
          <a href="/rankings" className="button-link">
            <FontAwesomeIcon icon={faArrowDown19} />
            <span>Alternative Rankings</span>
          </a>
        </li>
        <li>
          <a href="/records" className="button-link">
            <FontAwesomeIcon icon={faChartLine} />
            <span>Record History</span>
          </a>
        </li>
        <li>
          <a href="/person" className="button-link">
            <FontAwesomeIcon icon={faUser} />
            <span>Person Results</span>
          </a>
        </li>
        <li>
          <a href="/competition" className="button-link">
            <FontAwesomeIcon icon={faTrophy} />
            <span>Competition Results</span>
          </a>
        </li>
      </ul>

      <About />
    </PageLayout>
  );
}
