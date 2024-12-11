import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { DateTime } from 'luxon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import '../styles.css';

const HomePage = ({ token }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState([]);
  const [userLikes, setUserLikes] = useState([]);

  useEffect(() => {
    fetchPost();
    if (token?.user) {
      fetchUserLikes();
    }
  }, [token]);

  async function fetchPost() {
    try {
      const { data: posts, error: postError } = await supabase.from('post').select('*');
      if (postError) throw postError;

      const { data: likesData, error: likesError } = await supabase.rpc('count_likes');
      if (likesError) throw likesError;

      const postsWithLikes = posts.map((post) => ({
        ...post,
        likes: likesData.find((like) => like.post_id === post.id_post)?.like_count || 0,
      }));

      setPost(postsWithLikes);
    } catch (error) {
      console.error('Erro ao buscar posts:', error.message);
    }
  }

  async function fetchUserLikes() {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', token.user.id);
    if (error) {
      console.error('Erro ao buscar likes do usuário:', error.message);
      return;
    }
    setUserLikes(data.map((like) => like.post_id));
  }

  async function toggleLike(postId) {
    try {
      const isLiked = userLikes.includes(postId);

      if (isLiked) {
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', token.user.id)
          .eq('post_id', postId);
        if (deleteError) throw deleteError;

        setUserLikes((prev) => prev.filter((id) => id !== postId));
        setPost((prevPosts) =>
          prevPosts.map((post) =>
            post.id_post === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );
      } else {
        const { error: insertError } = await supabase
          .from('likes')
          .insert({ user_id: token.user.id, post_id: postId });
        if (insertError) throw insertError;

        setUserLikes((prev) => [...prev, postId]);
        setPost((prevPosts) =>
          prevPosts.map((post) =>
            post.id_post === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error('Erro ao alternar curtida:', error.message);
    }
  }

  async function deletarPost(postId) {
    const { error } = await supabase.from('post').delete().eq('id_post', postId);
    if (error) {
      console.error('Erro ao deletar o post:', error.message);
      return;
    }
    fetchPost();
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    navigate('/');
  }

  const formatarParaBrasilia = (utcTimestamp) =>
    DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toLocaleString(DateTime.DATETIME_MED);

  function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  return (
    <div className="containerH">
      <aside className="sidebarH">
        <div className="logoH">JD JUSTICA</div>
        <nav>
          <h3 className="h3H">
            Boas vindas, {token?.user?.username || 'Visitante'}
          </h3>
          <ul>
            <li>Leis</li>
            <li>Categorias</li>
            <li>Perguntas</li>
          </ul>
        </nav>
        <div className="personal-navigationH">
          <h4>NAVEGAÇÃO PESSOAL</h4>
          <ul>
            {token && <li>Suas perguntas</li>}
            {token && <li>Suas respostas</li>}
            {token && <li>Curtidas e comentários</li>}
            <li onClick={handleLogout}>Sair</li>
          </ul>
        </div>
      </aside>

      <main className="contentH">
        <header>
          <h1>Leis</h1>
          {token?.user?.role === 'admin' && (
            <button className="add-post-button" onClick={() => navigate('/add')}>
              Adicionar Post
            </button>
          )}
        </header>

        <section className="articlesH">
          {post.map((item) => (
            <article className="cardH" key={item.id_post}>
              <h2>{item.titulo}</h2>
              <p>
                {stripHtml(item.descricao).slice(0, 80)}...
                <button
                  className="read-more-button"
                  onClick={() => navigate(`/details/${item.id_post}`)}
                >
                  Leia Mais
                </button>
              </p>
              <div className="tagsH">
                <span>#Postagem</span>
                <span>#Atualizado</span>
              </div>
              <div className="card-footerH">
                <span>
                  {item.data_ultima_atualizacao
                    ? `Atualizado: ${formatarParaBrasilia(item.data_ultima_atualizacao)}`
                    : `Criado: ${formatarParaBrasilia(item.data_postagem)}`}
                </span>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleLike(item.id_post)}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{
                      color: userLikes.includes(item.id_post) ? 'red' : 'gray',
                      marginRight: '5px',
                    }}
                  />
                  {item.likes || 0}
                </span>
                <span>
                  <FontAwesomeIcon icon={faComment} style={{ marginRight: '5px' }} />
                  {item.quantidade_comentarios || 0}
                </span>
                {token?.user?.role === 'admin' && (
                  <>
                    <button
                      className="button-ed"
                      onClick={() => navigate(`/edit/${item.id_post}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="button-ed"
                      onClick={() => deletarPost(item.id_post)}
                    >
                      Deletar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
