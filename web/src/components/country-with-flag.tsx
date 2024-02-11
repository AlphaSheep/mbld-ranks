import React from "react";

export default function CountryWithFlag({ countryId }: { countryId: string | undefined }) {
  return <span>
    <span>{countryId}</span>
  </span>;
}