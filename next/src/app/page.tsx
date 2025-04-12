// app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from './components/Footer';
import CauseCard from '../components/CauseCard';
import CategoryCard from '../components/CategoryCard';
import { Cause, CategoryInfo } from './types';
import { getCauses, getCategories } from './lib/api';
import Head from 'next/head';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CauseCategories from './components/CauseCategories';
import LatestCauses from './components/LatestCauses';

export enum CauseCategory {
    NATURAL_DISASTER = 'Natural Disasters',
    CONFLICT_ZONE = 'Conflict Zone',
    HEALTH_EMERGENCY = 'Health Emergencies',
    FOOD_WATER_CRISIS = 'Food & Water Crisis'
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Navbar />
        <Hero />
        <CauseCategories />
        <LatestCauses />
        <Footer />
      </main>
    </div>
  );
}