import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill'; // Importando o Quill
import 'react-quill/dist/quill.snow.css'; // Estilo básico para o Quill

const AddPage = () => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({ titulo: '', descricao: '' });

  function handleChange(event) {
    const { name, value } = event.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditorChange(value) {
    setNewPost((prev) => ({ ...prev, descricao: value })); // Atualiza o conteúdo da descrição
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
        <ReactQuill
          theme="snow"
          value={newPost.descricao}
          onChange={handleEditorChange}
          placeholder="Descrição"
          className="descricao-editor"
        />
        <button type="submit" style={{ marginTop: '30px'}}>Adicionar Post</button>
      </form>
    </div>
  );
};

export default AddPage;
