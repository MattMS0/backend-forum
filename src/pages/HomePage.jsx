import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { DateTime } from 'luxon';
import '../styles.css';

const HomePage = ({ token }) => {
  const navigate = useNavigate();

  // Estados para o CRUD
  const [post, setPost] = useState([]);
  const [showAddPost, setShowAddPost] = useState(false); // Estado para exibir formulário de adição
  const [newPost, setNewPost] = useState({ titulo: '', descricao: '' });

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    const { data } = await supabase.from('post').select('*');
    setPost(data);
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    navigate('/');
  }

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
    fetchPost();
    setShowAddPost(false); // Fecha o formulário após adicionar
    setNewPost({ titulo: '', descricao: '' });
  }

  function handleEdit(postId) {
    navigate(`/edit/${postId}`); // Redireciona para a página de edição
  }

  const formatarParaBrasilia = (utcTimestamp) => {
    return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toLocaleString(DateTime.DATETIME_MED);
  };


  function handleEdit(postId) {
    navigate(`/edit/${postId}`); // Redireciona para a página de edição
  }


  return (
    <div className="containerH">
      <aside className="sidebarH">
        <div className="logoH">JD JUSTICA</div>
        <nav>
          <h3 className="h3H">
            Boas vindas, {token?.user?.user_metadata?.fullname || 'Visitante'}
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
          {token && (
            <button className='add-post-button' onClick={() => ((navigate)('/add'))}>
              Adicionar Post
            </button>
          )}
        </header>

        {showAddPost && (
          <form onSubmit={criarPost}>
            <input
              type="text"
              placeholder="Título"
              name="titulo"
              value={newPost.titulo}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Descrição"
              name="descricao"
              value={newPost.descricao}
              onChange={handleChange}
            />
            <button type="submit">Criar</button>
          </form>
        )}

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
                <span>{formatarParaBrasilia(item.data_postagem)}</span>
                {token && (
                  <>
                    <button className= 'button-ed'onClick={() => handleEdit(item.id_post)}>
                      Editar
                    </button>
                    <button className= 'button-ed'onClick={() => deletarPost(item.id_post)}>
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
