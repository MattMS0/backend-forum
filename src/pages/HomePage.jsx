import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { DateTime } from 'luxon';
import '../styles.css';

const HomePage = ({ token }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState([]);

  useEffect(() => {
    fetchPost();
    console.log('Token: ', token);
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
            <li onClick={handleLogout}>Logout</li>
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
              <p>{item.descricao}</p>
              <div className="tagsH">
                <span>#Postagem</span>
                <span>#Atualizado</span>
              </div>
              <div className="card-footerH">
                <span>
                  Criado: {formatarParaBrasilia(item.data_postagem)}
                </span>
                {item.data_ultima_atualizacao && (
                  <span>
                    Atualizado: {formatarParaBrasilia(item.data_ultima_atualizacao)}
                  </span>
                )}
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
