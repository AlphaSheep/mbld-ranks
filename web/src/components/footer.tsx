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

  return <>
    <footer>
      <span>
        Based on <a href="https://worldcubeassociation.org/results">WCA results</a>
        {updatedAt && <>, last updated on {updatedAt.toDateString()}</>}.
      </span>
      <span>
        <a href="">
          <FontAwesomeIcon icon={faGithub} /> Github
        </a>
      </span>
    </footer>
  </>;
};