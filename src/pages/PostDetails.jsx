import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import '../styles.css';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostDetails();
  }, []);

  // Função para buscar detalhes do post
  async function fetchPostDetails() {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('id_post', id)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes:', error.message);
      return;
    }
    setPost(data);
  }

  // Função para remover tags HTML
  function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  return (
    <div className="containerH">
      <main className="contentH">
        {post ? (
          <article className="cardH">
            <h1>{post.titulo}</h1>
            <p className="post-content">{stripHtml(post.descricao)}</p>
            <button className="back-button" onClick={() => navigate(-1)}>
              Voltar
            </button>
          </article>
        ) : (
          <p>Carregando detalhes...</p>
        )}
      </main>
    </div>
  );
};

export default PostDetails;
