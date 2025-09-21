import React, { useState } from 'react';
import { Card } from "primereact/card";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function SignUpCard({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (!name || !email) {
      setError('Please enter your name and email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5266/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed');
      }

      const userData = await response.json();
      console.log('Sign up successful:', userData);

      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {error && (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <InputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4"
          placeholder="Your name"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <span className="p-input-icon-left w-full mb-4 block">
          <i className="pi pi-envelope" />
          <InputText
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            placeholder="you@example.com"
          />
        </span>

        <Button
          label={loading ? 'Signing Up...' : 'Sign Up'}
          className="w-full mt-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          onClick={handleSignUp}
          disabled={loading}
        />

        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <button onClick={onSwitch} className="text-indigo-600 font-semibold">
            Sign in
          </button>
        </div>
      </Card>
    </div>
  );
}
