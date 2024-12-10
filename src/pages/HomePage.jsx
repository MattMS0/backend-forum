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

  useEffect(() => {
    fetchPost();
  }, [token]);

  async function fetchPost() {
    const { data } = await supabase.from('post').select('*');
    setPost(data);
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    navigate('/');
  }

  async function deletarPost(postId) {
    const { error } = await supabase.from('post').delete().eq('id_post', postId);
    if (error) {
      console.error("Erro ao deletar o post:", error.message);
      return;
    }
    fetchPost(); // Atualiza a lista de posts
  }

  const formatarParaBrasilia = (utcTimestamp) => {
    return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toLocaleString(DateTime.DATETIME_MED);
  };

  // Função para remover tags HTML
  function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  // Função para alternar curtidas
  async function toggleLike(postId, userId) {
    try {
      // Verifica se o usuário já curtiu o post
      const { data: existingLike, error: fetchError } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
  
      if (fetchError) {
        console.error(fetchError.message);
        return;
      }
  
      if (existingLike) {
        // Se já curtiu, remove o like
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
  
        if (deleteError) {
          console.error(deleteError.message);
          return;
        }
  
        // Atualiza o estado local decrementando o like
        setPost((prevPosts) =>
          prevPosts.map((post) =>
            post.id_post === postId
              ? { ...post, likes: post.likes - 1 }
              : post
          )
        );
  
        // Decrementa no banco de dados
        await supabase.rpc('decrement_likes', { post_id: postId });
      } else {
        // Se não curtiu, adiciona o like
        const { error: insertError } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });
  
        if (insertError) {
          console.error(insertError.message);
          return;
        }
  
        // Atualiza o estado local incrementando o like
        setPost((prevPosts) =>
          prevPosts.map((post) =>
            post.id_post === postId
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        );
  
        // Incrementa no banco de dados
        await supabase.rpc('increment_likes', { post_id: postId });
      }
    } catch (error) {
      console.error('Erro ao alternar curtida:', error.message);
    }
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
              <p>{stripHtml(item.descricao)}</p>
              <div className="tagsH">
                <span>#Postagem</span>
                <span>#Atualizado</span>
              </div>
              <div className="card-footerH">
                {item.data_ultima_atualizacao ? (
                  <span>
                    Atualizado: {formatarParaBrasilia(item.data_ultima_atualizacao)}
                  </span>
                ) : (
                  <span>
                    Criado: {formatarParaBrasilia(item.data_postagem)}
                  </span>
                )}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleLike(item.id_post, token?.user?.id)}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{ color: item.likes > 0 ? 'red' : 'gray', marginRight: '5px' }}
                  />
                  {item.likes || 0}
                </span>
                <span>
                  <FontAwesomeIcon icon={faComment} style={{ marginRight: '5px' }} />
                  {item.quantidade_comentarios || 0}
                </span>
                {token?.user?.role === 'admin' && (
                  <>
                    <button className="button-ed" onClick={() => navigate(`/edit/${item.id_post}`)}>
                      Editar
                    </button>
                    <button className="button-ed" onClick={() => deletarPost(item.id_post)}>
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
