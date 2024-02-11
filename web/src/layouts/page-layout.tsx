import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { ScrollRestoration } from 'react-router-dom';

export default function PageLayout(props: any) {
  return <>
    <ScrollRestoration />
    <div className="page-container">
      <Navbar/>
      <div className="page-content">
        {props.children}
      </div>
      <Footer/>
    </div>
  </>;
}