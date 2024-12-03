import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AddPage = ({ token }) => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({ titulo: '', descricao: '' });

  function handleChange(event) {
    const { name, value } = event.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  }

  async function criarPost(event) {
    event.preventDefault();
    const dataAtual = new Date().toISOString();
    await supabase
      .from('post')
      .insert({ ...newPost, data_postagem: dataAtual });
    navigate('/home'); // Redireciona para a página inicial após criar o post
  }

  return (
    <div className="add-page-container">
      <header className="add-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> {/* Ícone de voltar */}
        </button>
        <h1>Adicionar Novo Post</h1>
      </header>

      <form onSubmit={criarPost}>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={newPost.titulo}
          onChange={handleChange}
        />
        <textarea
          name="descricao"
          placeholder="Descrição"
          value={newPost.descricao}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Adicionar Post</button>
      </form>
    </div>
  );
};

export default AddPage;
