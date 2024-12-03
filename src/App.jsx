import React, { useEffect, useState } from 'react';
import { Login_SignUp, HomePage, EditPage, AddPage } from './pages'; // Importe o EditPage
import { Routes, Route } from 'react-router-dom';

const App = () => {
  const [token, setToken] = useState(false);

  if (token) {
    sessionStorage.setItem('token', JSON.stringify(token));
  }

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      let data = JSON.parse(sessionStorage.getItem('token'));
      setToken(data);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login_SignUp setToken={setToken} />} />
        {token && (
          <>
            <Route path="/home" element={<HomePage token={token} />} />
            <Route path="/edit/:postId" element={<EditPage token={token} />} />
            <Route path="/add" element={<AddPage token={token} />} />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;
