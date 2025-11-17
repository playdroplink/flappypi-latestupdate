import { useEffect, useState } from 'react';
import PiAuthLogin from '../components/PiAuthLogin';
// import SplashScreen from '../components/SplashScreen'; // Uncomment if SplashScreen exists

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
    // return <SplashScreen />;
    return <div>Loading...</div>; // Use a simple loading message if SplashScreen is not available
  }

  return (
    <div>
      <PiAuthLogin />
    </div>
  );
};

export default Home;