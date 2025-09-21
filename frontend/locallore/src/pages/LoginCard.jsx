import React, { useState } from 'react';
import { Card } from "primereact/card";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';


export default function LoginCard({ onSubmit }) {
  const [email, setEmail] = useState('');


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>  

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
          label="Sign In"
          className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => onSubmit?.({ email, password })}
        />
      </Card>
    </div>
  );
}



