import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage, Login_SignUp, AddPage, EditPage, PostDetails, MinhasCurtidas, MeusComentarios } from './pages'; // Importe as novas páginas

const App = () => {
  const [token, setToken] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      let data = JSON.parse(sessionStorage.getItem('token'));
      setToken(data);
    }
  }, []);

  if (token) {
    sessionStorage.setItem('token', JSON.stringify(token));
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login_SignUp setToken={setToken} />} />
        <Route path="/home" element={<HomePage token={token} />} />
        <Route path="/details/:id" element={<PostDetails />} />
        <Route path="/minhas-curtidas" element={<MinhasCurtidas token={token} />} />
        <Route path="/meus-comentarios" element={<MeusComentarios token={token} />} />
        {token?.user?.role === 'admin' && (
          <>
            <Route path="/edit/:postId" element={<EditPage token={token} />} />
            <Route path="/add" element={<AddPage token={token} />} />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;
