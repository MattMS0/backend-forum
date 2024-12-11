import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import '../styles.css';

const MeusComentarios = ({ token }) => {
  const navigate = useNavigate();
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [postsWithComments, setPostsWithComments] = useState([]);

  useEffect(() => {
    if (token?.user) {
      fetchCommentedPosts();
    }
  }, [token]);

  // Função para buscar os posts que o usuário comentou e o número de comentários
  async function fetchCommentedPosts() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('post_id')
        .eq('user_id', token.user.id);

      if (error) throw error;

      // Buscar detalhes dos posts que o usuário comentou
      const postIds = data.map((comment) => comment.post_id);
      const { data: posts, error: postError } = await supabase
        .from('post')
        .select('*')
        .in('id_post', postIds);

      if (postError) throw postError;

      // Buscar os comentários dos posts
      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id_post);

          if (commentsError) throw commentsError;

          return { ...post, comments: commentsData.length };
        })
      );

      setPostsWithComments(postsWithComments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error.message);
    }
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
        <header>
          <h1>Meus Comentários</h1>
          <button onClick={() => navigate(-1)} className="back-button">
            Voltar
          </button>
        </header>

        <section className="articlesH">
          {postsWithComments.map((item) => (
            <article className="cardH" key={item.id_post}>
              <h2>{item.titulo}</h2>
              <p>{stripHtml(item.descricao).slice(0, 160)}...</p>
              <button
                className="read-more-button"
                onClick={() => navigate(`/details/${item.id_post}`)}
              >
                Leia Mais
              </button>
              <div className="card-footerH">
                <span>
                  <FontAwesomeIcon icon={faComment} style={{ marginRight: '5px' }} />
                  {item.comments || 0}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MeusComentarios;
