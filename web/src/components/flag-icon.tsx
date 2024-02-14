import * as React from 'react'
import Country from '../interfaces/country';

import "flag-icons/css/flag-icons.min.css";
import "./flag-icon.less";

export default function FlagIcon({ country }: { country: Country | undefined }) {
  return country ? <span className={'fi fi-'+country.iso2.toLowerCase()}></span> : null;
}
