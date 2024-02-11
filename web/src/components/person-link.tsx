import React from "react";

export default function PersonLink({ personId, personName }: { personId: string, personName: string }) {
  return <a href={`/person?wcaid=${personId}`}>{personName}</a>;
}