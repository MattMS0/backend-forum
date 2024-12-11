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
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de busca
  const [postComments, setPostComments] = useState([]);  // Estado para armazenar os comentários dos posts

  // Chama a função de sincronizar o usuário com a tabela `usuario` apenas quando o token muda ou o usuário se autentica
  useEffect(() => {
    if (token?.user) {
      syncUserWithDatabase();
      
      fetchUserLikes();
    }
    fetchPost();
  }, [token]);

  // Função para sincronizar usuário com a tabela `usuario` apenas quando necessário
  async function syncUserWithDatabase() {
    const token = JSON.parse(sessionStorage.getItem('token'));  // Recupera o token de autenticação
    console.log('Token:', token); // Verifique o token para garantir que `user.id` esteja lá

    if (!token || !token.user || !token.user.id) {
      console.error('Usuário não autenticado ou ID do usuário não encontrado.');
      return;
    }

    const userId = token.user.id;  // Recupera o `user.id` do Supabase Auth
    const username = token.user.username || 'Nome de usuário'; // Assumindo que você tenha `username` no token

    // Adiciona ou atualiza o usuário na tabela `usuario` sem tentar usar `created_at`
    const { data, error } = await supabase
      .from('usuario')
      .upsert([
        {
          id: userId,            // O `user.id` do Supabase Auth
          username: username,    // O nome de usuário
          email: token.user.email,  // E-mail do usuário
        }
      ])
      .eq('id', userId);  // Condição para garantir que estamos atualizando o usuário correto

    if (error) {
      console.error('Erro ao sincronizar o usuário com a tabela `usuario`:', error.message);
    } else {
      console.log('Usuário sincronizado com sucesso na tabela `usuario`');
    }
  }

  // Função para buscar os posts
  async function fetchPost() {
    try {
      const { data: posts, error: postError } = await supabase.from('post').select('*');
      if (postError) throw postError;

      const { data: likesData, error: likesError } = await supabase.rpc('count_likes');
      if (likesError) throw likesError;

      // Buscar comentários para cada post
      const postIds = posts.map(post => post.id_post);
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);  // Buscar comentários dos posts

      if (commentsError) throw commentsError;

      const postCommentsCount = postIds.map(postId => ({
        postId,
        commentsCount: commentsData.filter(comment => comment.post_id === postId).length
      }));

      // Criar um objeto que mapeia postId para a quantidade de comentários
      const postsWithLikesAndComments = posts.map(post => {
        const commentsCount = postCommentsCount.find(item => item.postId === post.id_post)?.commentsCount || 0;
        return {
          ...post,
          likes: likesData.find((like) => like.post_id === post.id_post)?.like_count || 0,
          quantidade_comentarios: commentsCount  // Adicionar a quantidade de comentários ao post
        };
      });

      setPost(postsWithLikesAndComments);
      setPostComments(commentsData); // Atualiza a lista de comentários para a página
    } catch (error) {
      console.error('Erro ao buscar posts:', error.message);
    }
  }

  // Função para buscar os likes do usuário
  async function fetchUserLikes() {
    if (!token || !token.user) return;  // Evita erro se `token.user` não existir
  
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
  

  // Função para alternar curtidas
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

  // Função para deletar post
  async function deletarPost(postId) {
    const { error } = await supabase.from('post').delete().eq('id_post', postId);
    if (error) {
      console.error('Erro ao deletar o post:', error.message);
      return;
    }
    fetchPost();
  }

  // Função de logout
  function handleLogout() {
    sessionStorage.removeItem('token');
    navigate('/');
  }

  const formatarParaBrasilia = (utcTimestamp) =>
    DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      .setLocale('pt-BR')  // Define a localidade para PT-BR
      .setZone('America/Sao_Paulo')
      .toLocaleString(DateTime.DATETIME_MED);

  // Função para filtrar posts pelo título ou descrição com base no termo de busca
  const filteredPosts = post.filter((item) =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para remover tags HTML
  function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  // Função para deletar post
  async function deletarPost(postId, id_usuario_post) {
    if (token?.user?.id !== id_usuario_post) {
      alert('Você não tem permissão para deletar este post.');
      return;
    }
  
    const { error } = await supabase
      .from('post')
      .delete()
      .eq('id_post', postId);
  
    if (error) {
      console.error('Erro ao deletar o post:', error.message);
      return;
    }
    fetchPost();
  }
  



  return (
    <div className="containerH">
      <aside className="sidebarH">
        <div className="logoH">Portal do Consumidor</div>
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
            {token && <li onClick={() => navigate('/minhas-curtidas')}>Minhas Curtidas</li>}
            {token && <li onClick={() => navigate('/meus-comentarios')}>Meus Comentários</li>}
            <li onClick={handleLogout}>Sair</li>
          </ul>
        </div>
      </aside>

      <main className="contentH">
        <header>
          <h1>Posts</h1>
          {token?.user?.role === 'admin' && (
            <button className="add-post-button" onClick={() => navigate('/add')}>
              Adicionar Post
            </button>
          )}
          {/* Campo de busca */}
          <input
            type="text"
            placeholder="Buscar posts..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>

        <section className="articlesH">
          {filteredPosts.map((item) => (
            <article className="cardH" key={item.id_post}>
              <h2>{item.titulo}</h2>
              <p>
                {stripHtml(item.descricao).slice(0, 160)}...
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
                {token?.user?.role === 'admin' && token?.user?.id === item.id_usuario_post && (
                  <>
                    <button
                      className="button-ed"
                      onClick={() => navigate(`/edit/${item.id_post}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="button-ed"
                      onClick={() => deletarPost(item.id_post, item.id_usuario_post)}
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
