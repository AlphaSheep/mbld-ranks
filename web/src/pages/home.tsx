import React from "react";
import PageLayout from "../layouts/page-layout";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faTrophy, faUser, faChartLine, faArrowDown19 } from "@fortawesome/free-solid-svg-icons";

export default function HomePage () {
  return <PageLayout>
    <h1>Home</h1>

    <p>
      This is an unofficial alternative ranking system for the multiple blindfolded event. Results are based on those
      of the <a href="https://www.worldcubeassociation.org/" target="_blank" rel="noreferrer">World Cube Association</a>.
    </p>

    <ul className="link-list">
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
    </ul>

    <p>
      The scoring system used for the alternative rankings is as follows:
    </p>

    <div className="code">
      <div>accuracy = solved / attempted</div>
      <div>time_used = time_in_seconds / time_available_in_seconds</div>

      <div>score = solved * (accuracy) / sqrt(time_used)</div>
    </div>

    <p>
      For detailed analysis and justification for this scoring system, please see <a
        href="https://medium.com/@caring_lion_hedgehog_829/multiblind-scoring-system-353c18a61dfe" target="_blank" rel="noreferrer">
        this article
      </a>.
    </p>
  </PageLayout>;
};
