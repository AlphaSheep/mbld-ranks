import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { resultsService } from "../services/results-service";

import "./footer.less";

export default function Footer () {

  const [updatedAt, setUpdatedAt] = useState<Date | undefined>(undefined);

  useEffect(() => {
    resultsService.getMetadata().then((data) => {
      setUpdatedAt(data.updated_at);
    });
  }, []);

  const apiDocsUrl = `${process.env.API_URL}/docs`;

  return <>
    <footer>
      <div>
        <span>
          Built with 💚 by <a href="https://bgray.dev">Brendan James Gray</a>
        </span>
      </div>

      <div>
        <span>
          Based on <a href="https://worldcubeassociation.org/results">WCA results</a>
          {updatedAt && <>, last updated on {updatedAt.toDateString()}</>}.
        </span>
        <span>
          <a href={apiDocsUrl}><strong>API docs</strong></a>
        </span>
        <span>
          <a href="https://github.com/AlphaSheep/mbld-ranks" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faGithub} /> Github
          </a>
        </span>
      </div>

    </footer>
  </>;
};
