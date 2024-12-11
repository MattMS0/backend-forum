import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import '../styles.css';

const MinhasCurtidas = ({ token }) => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [postsWithLikes, setPostsWithLikes] = useState([]);

  useEffect(() => {
    if (token?.user) {
      fetchLikedPosts();
    }
  }, [token]);

  // Função para buscar os posts que o usuário curtiu e as curtidas
  async function fetchLikedPosts() {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', token.user.id);

      if (error) throw error;

      // Buscar detalhes dos posts que o usuário curtiu
      const postIds = data.map((like) => like.post_id);
      const { data: posts, error: postError } = await supabase
        .from('post')
        .select('*')
        .in('id_post', postIds);

      if (postError) throw postError;

      // Buscar as curtidas dos posts
      const postsWithLikes = await Promise.all(
        posts.map(async (post) => {
          const { data: likesData, error: likesError } = await supabase
            .rpc('count_likes')
            .eq('post_id', post.id_post);

          if (likesError) throw likesError;

          return { ...post, likes: likesData?.[0]?.like_count || 0 };
        })
      );

      setPostsWithLikes(postsWithLikes);
    } catch (error) {
      console.error('Erro ao buscar curtidas:', error.message);
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
          <h1>Minhas Curtidas</h1>
          <button onClick={() => navigate(-1)} className="back-button">
            Voltar
          </button>
        </header>

        <section className="articlesH">
          {postsWithLikes.map((item) => (
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
                  <FontAwesomeIcon icon={faHeart} style={{ color: 'red', marginRight: '5px' }} />
                  {item.likes || 0}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MinhasCurtidas;
