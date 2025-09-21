
import React, { useState } from 'react';
import LoginCard from './LoginCard';
import SignUpCard from './SignUpCard';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <LoginCard onSwitch={toggleView} />
      ) : (
        <SignUpCard onSwitch={toggleView} />
      )}
    </>
  );
}