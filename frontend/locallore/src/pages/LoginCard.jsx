import React, { useState } from 'react';
import { Card } from "primereact/card";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function LoginCard({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5266/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      console.log('Login successful:', userData);

      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(135deg, #ffedd4 0%, #77966d 100%)' 
    }}>
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#544343' }}>
            Welcome Back
          </h2>
          <p className="text-lg" style={{ color: '#626d58' }}>
            Sign in to explore local gems
          </p>
        </div>

        {error && (
          <div className="error-message mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">Email Address</label>
            <div className="relative w-full">
              <i className="pi pi-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-base z-10 pointer-events-none" style={{ color: '#626d58' }} />
              <InputText
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <Button
            label={loading ? 'Signing In...' : 'Sign In'}
            className="w-full mt-6"
            onClick={handleLogin}
            disabled={loading}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            iconPos="left"
          />
        </div>

        <div className="mt-8 text-center">
          <p style={{ color: '#626d58' }}>
            Don't have an account?{' '}
            <button 
              onClick={onSwitch} 
              className="font-semibold hover:underline transition-all duration-200"
              style={{ color: '#77966d' }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
