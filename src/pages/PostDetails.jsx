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

  return (
    <div className="containerH">
      <main className="contentH">
        {post ? (
          <article className="cardH">
            <h1>{post.titulo}</h1>
            {/* Renderizando o conteúdo HTML do Quill */}
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.descricao }}></div>
            <button className="back-button" onClick={() => navigate(-1)}>
              Voltar
            </button>
          </article>
        ) : (
          <p>Carregando post...</p>
        )}
      </main>
    </div>
  );
};

export default PostDetails;
