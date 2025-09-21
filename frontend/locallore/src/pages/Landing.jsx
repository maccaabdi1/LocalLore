



import LoginCard from './LoginCard';

export default function Page() {
  const handleLogin = (creds) => {
    console.log('login', creds);
    // call your API
  };

  return <LoginCard onSubmit={handleLogin} />;
}