import React from "react";
import Person from "../interfaces/person";
import CountryWithFlag from "./country-with-flag";

export default function PersonDetails({ person }: { person: Person | undefined }) {

  return <div>
    <h1>{person?.name}</h1>
    <p>{person?.id}</p>
    <p><CountryWithFlag countryId={person?.countryId} /></p>
  </div>;
}