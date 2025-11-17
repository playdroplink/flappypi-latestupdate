import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import PiAuthLogin from '../components/PiAuthLogin';


const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [isAuthenticated, setIsAuthenticated] = useState(false); // Remove if not used

  useEffect(() => {
    // Simulate a loading period before checking authentication
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Replace SplashScreen with a simple loading message
  }

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://flappypi.fun/" />
      </Helmet>
      <div>
        <PiAuthLogin />
      </div>
    </>
  );
};

export default Home;