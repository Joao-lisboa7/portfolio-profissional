import { useTranslation } from 'react-i18next';
import './home.css';
import Navbar from '../../components/navbar/Navbar';
import GameMenu from '../../components/menu/Menu';

function Home (){
  const { t } = useTranslation();
  const menuItems = [
    { id: '1', label: t('menu.about'), href: '/about'},
    { id: '2', label: t('menu.projects'), href: '/projetos' },
    { id: '4', label: t('menu.experience'), href: '/experiences' },
    { id: '5', label: t('menu.statistics'), href: '/statistics' },
    { id: '3', label: t('menu.contact'), href: '/Contatos' },
  ]

  return(
    <main className="home-page">
      {/* Vídeo de background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="home-page__background"
        src="/video/Faiscas-de-Fogo-SnapYT.App.mp4"
      />

      <Navbar title={t('home.title')} showBackButton={false} />

      <GameMenu
        title={t('home.name')}
        subtitle={t('home.role')}
        items={menuItems} 
      />

    </main>
  )
}

export default Home;