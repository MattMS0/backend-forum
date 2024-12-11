import React, { useEffect, useState } from 'react';
import { Login_SignUp, HomePage, EditPage, AddPage, PostDetails } from './pages';
import { Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  const [token, setToken] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      setToken(JSON.parse(savedToken));
    }
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', JSON.stringify(token));
    }
  }, [token]);

  return (
    <div>
      <Routes>
        {/* Rota de Login */}
        <Route path="/" element={<Login_SignUp setToken={setToken} />} />

        {/* Página Inicial */}
        <Route path="/home" element={<HomePage token={token} />} />

        {/* Rota Detalhes da Postagem */}
        <Route path="/details/:id" element={<PostDetails />} />

        {/* Rotas Protegidas para Admin */}
        {token?.user?.role === 'admin' && (
          <>
            <Route path="/edit/:postId" element={<EditPage token={token} />} />
            <Route path="/add" element={<AddPage token={token} />} />
          </>
        )}

        {/* Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
