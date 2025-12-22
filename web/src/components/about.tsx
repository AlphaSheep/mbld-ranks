import React from "react";

import Equation from "../assets/equation";

import "./about.less";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <div className="about prose">
      <p>The scoring system used for the alternative rankings is as follows:</p>
      <div className="code">
        <div>accuracy = solved / attempted</div>
        <div>time_used = time_in_seconds / time_available_in_seconds</div>

        <div>score = solved * (accuracy) / sqrt(time_used)</div>
      </div>

      <Equation className="equation-image" />

      <p>
        This system is specifically designed to balance rewarding larger
        attempts, higher accuracy, and faster times. It was informed by a
        detailed statistical analysis of nearly 20&nbsp;000 official results
        over 17 years of competitions. The details of this analysis are
        published in the following article:
      </p>
      <a
        className="article-box"
        href="https://bgray-dev.medium.com/multiblind-scoring-system-353c18a61dfe"
        target="_blank"
        rel="noreferrer"
      >
        <div className="external-icon">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </div>
        <h3 className="article-title">
          Ranking Multiple Blindfolded Rubik's Cube Solves
        </h3>
        <h4 className="article-subtitle">
          A data-driven proposal for a new system for ranking attempts at
          solving multiple Rubik’s cubes blindfolded.
        </h4>
        <div className="article-details">32 min read · 4 Feb 2024</div>
        <div className="article-link">bgray-dev.medium.com</div>
      </a>

      <p>
        Should the WCA change to this system? No, please no. But it's a fun
        exercise to explore.
      </p>
    </div>
  );
}
