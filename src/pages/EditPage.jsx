import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const EditPage = ({ token }) => {
  const navigate = useNavigate();
  const { postId } = useParams(); // Captura o ID do post da URL
  const [postEdit, setPostEdit] = useState({ titulo: '', descricao: '' });

  useEffect(() => {
    fetchPostData();
  }, []);

  async function fetchPostData() {
    const { data } = await supabase.from('post').select('*').eq('id_post', postId).single();
    setPostEdit(data || { titulo: '', descricao: '' });
  }

  async function atualizarPost(event) {
    event.preventDefault();
    const dataAtual = new Date().toISOString();
    await supabase
      .from('post')
      .update({
        ...postEdit,
        data_ultima_atualizacao: dataAtual,
      })
      .eq('id_post', postId);
    navigate('/home'); // Redireciona para a página inicial após salvar
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setPostEdit((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="edit-page-container">
      <header className="edit-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> {/* Ícone de voltar */}
        </button>
        <h1>Editar Post</h1>
      </header>

      <form onSubmit={atualizarPost}>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={postEdit.titulo}
          onChange={handleChange}
        />
        <textarea
          name="descricao"
          placeholder="Descrição"
          value={postEdit.descricao}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditPage;
