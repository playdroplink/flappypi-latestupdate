import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPiBrowser } from '../utils/browserDetection';

const BrowserDetection: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPiBrowser()) {
      navigate('/not-in-pi-browser');
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <img src="/flappy-pi-logo.png" alt="Flappy Pi Logo" style={styles.logo} />
      <h1 style={styles.title}>Flappy Pi</h1>
      <h2 style={styles.subtitle}>Open in Pi Browser</h2>
      <p style={styles.description}>
        To access all features of Flappy Pi, including payments and rewards, please open this game in the official Pi Browser.
      </p>
      <button
        style={styles.button}
        onClick={() => window.open('https://pi.app/download', '_blank')}
      >
        Download Pi Browser
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center' as const,
    padding: '50px',
    backgroundColor: '#f5f5f5',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '150px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#6c63ff',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
    maxWidth: '400px',
  },
  button: {
    backgroundColor: '#6c63ff',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default BrowserDetection; 