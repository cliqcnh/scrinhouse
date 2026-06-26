"use client";
import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import styles from './PriceEstimator.module.css';
import Link from 'next/link';

const data = {
  brands: ['Apple', 'Samsung'],
  models: {
    Apple: ['iPhone 14 Pro Max', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
    Samsung: ['Galaxy S23 Ultra', 'Galaxy S22', 'Galaxy A54']
  },
  problems: {
    'iPhone 14 Pro Max': { 'Screen Replacement': 'GHS 3,500 - 3,800', 'Battery Replacement': 'GHS 800 - 950' },
    'iPhone 13': { 'Screen Replacement': 'GHS 2,200 - 2,500', 'Battery Replacement': 'GHS 600 - 750' },
    'iPhone 12': { 'Screen Replacement': 'GHS 1,500 - 1,800', 'Battery Replacement': 'GHS 500 - 650' },
    'iPhone 11': { 'Screen Replacement': 'GHS 950 - 1,200', 'Battery Replacement': 'GHS 400 - 550' },
  }
};

export default function PriceEstimator() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [problem, setProblem] = useState('');

  const availableModels = brand ? (data.models[brand] || []) : [];
  
  const availableProblems = model 
    ? (data.problems[model] ? Object.keys(data.problems[model]) : ['Screen Replacement', 'Battery Replacement', 'Charging Port'])
    : [];

  let estimatedPrice = null;
  if (brand && model && problem) {
    if (data.problems[model] && data.problems[model][problem]) {
      estimatedPrice = data.problems[model][problem];
    } else {
      estimatedPrice = 'Request Quote';
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Repair Price Estimator</h2>
          <p className={styles.subtitle}>Get an instant estimate for your device repair before you book.</p>
        </div>

        <Card className={styles.estimatorCard}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Brand</label>
              <select className={styles.select} value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); setProblem(''); }}>
                <option value="">Select Brand</option>
                {data.brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Model</label>
              <select className={styles.select} value={model} onChange={(e) => { setModel(e.target.value); setProblem(''); }} disabled={!brand}>
                <option value="">Select Model</option>
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Problem</label>
              <select className={styles.select} value={problem} onChange={(e) => setProblem(e.target.value)} disabled={!model}>
                <option value="">Select Problem</option>
                {availableProblems.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {estimatedPrice && (
            <div className={styles.resultContainer}>
              <div className={styles.estimateBox}>
                <span className={styles.estimateLabel}>Estimated Price Range</span>
                <span className={styles.estimateValue}>{estimatedPrice}</span>
              </div>
              <Link href="/repair-booking">
                <Button variant="primary" className={styles.bookBtn}>Book This Repair</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
