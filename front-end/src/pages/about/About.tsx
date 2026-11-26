import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Brain,
  BriefcaseBusiness,
  Code2,
  Database,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Network,
  UsersRound,
} from 'lucide-react';
import './about.css';
import Navbar from '@/components/navbar/Navbar';
import FrameImg from '@/components/frame-img/FrameImg';

const profileImage = new URL('../../assets/foto_curriculo.JPG', import.meta.url).href;

const technicalSkills = [
  {
    icon: Code2,
    titleKey: 'about.skills.software.title',
    skills: ['Java', 'Spring Boot', 'JavaScript', 'TypeScript', 'React'],
    descriptionKey: 'about.skills.software.desc',
  },
  {
    icon: Database,
    titleKey: 'about.skills.data.title',
    skills: ['SQL', 'PostgreSQL', 'Supabase', 'Modelagem de dados'],
    descriptionKey: 'about.skills.data.desc',
  },
  {
    icon: Network,
    titleKey: 'about.skills.product.title',
    skills: ['Requisitos', 'Processos', 'Indicadores', 'Scrum', 'Kanban'],
    descriptionKey: 'about.skills.product.desc',
  },
];

const softSkills = [
  {
    icon: Brain,
    titleKey: 'about.skills.analytical.title',
    descriptionKey: 'about.skills.analytical.desc',
  },
  {
    icon: MessageCircle,
    titleKey: 'about.skills.communication.title',
    descriptionKey: 'about.skills.communication.desc',
  },
  {
    icon: UsersRound,
    titleKey: 'about.skills.collaboration.title',
    descriptionKey: 'about.skills.collaboration.desc',
  },
  {
    icon: Lightbulb,
    titleKey: 'about.skills.learning.title',
    descriptionKey: 'about.skills.learning.desc',
  },
];

const AboutMe: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="about-page min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-red-900 selection:text-white overflow-hidden">
      <Navbar title={t('about.navTitle')} />

      <div className="about-page__backdrop" aria-hidden="true" />

      <main className="about-page__main">
        <header className="about-intro animate-fade-in-up" aria-labelledby="about-title">
          <div className="about-intro__copy">
            <div className="about-eyebrow">
              <span>01</span>
              <span>{t('about.eyebrowIntro')}</span>
              <i aria-hidden="true" />
            </div>
            <p className="about-intro__overline">{t('about.overline')}</p>
            <h1 id="about-title" className="about-intro__name">{t('about.name')}</h1>
            <h2 className="about-intro__role">{t('about.role')}</h2>
            <p className="about-intro__summary">
              {t('about.summary')}
            </p>
            <a className="about-intro__link" href="#origem">
              {t('about.trajectoryLink')} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="about-intro__portrait">
            <FrameImg className="w-64 h-64 md:w-80 md:h-80 mx-auto" imageUrl={profileImage} />
            <span className="about-intro__portrait-caption">{t('about.portraitCaption')}</span>
          </div>
        </header>

        <section className="about-section about-origin" id="origem" aria-labelledby="origin-title">
          <div className="about-section__heading">
            <div className="about-eyebrow"><span>02</span><span>{t('about.eyebrowOrigin')}</span></div>
            <h2 id="origin-title">{t('about.originHeading')}</h2>
            <p>{t('about.originIntro')}</p>
          </div>

          <div className="about-origin__grid">
            <article className="about-info-card">
              <div className="about-info-card__icon"><GraduationCap size={19} aria-hidden="true" /></div>
              <div>
                <span className="about-card-label">{t('about.academicLabel')}</span>
                <h3>{t('about.academicTitle')}</h3>
                <p className="about-info-card__meta">{t('about.academicMeta')}</p>
                <p>
                  {t('about.academicDesc')}
                </p>
              </div>
            </article>

            <article className="about-info-card">
              <div className="about-info-card__icon"><BriefcaseBusiness size={18} aria-hidden="true" /></div>
              <div>
                <span className="about-card-label">{t('about.professionalLabel')}</span>
                <h3>{t('about.professionalTitle')}</h3>
                <p className="about-info-card__meta">{t('about.professionalMeta')}</p>
                <p>
                  {t('about.professionalDesc')}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="about-section about-arsenal" aria-labelledby="arsenal-title">
          <div className="about-section__heading">
            <div className="about-eyebrow"><span>03</span><span>{t('about.eyebrowArsenal')}</span></div>
            <h2 id="arsenal-title">{t('about.arsenalHeading')}</h2>
            <p>{t('about.arsenalIntro')}</p>
          </div>

          <div className="about-skills">
            <div className="about-skills__technical">
              <div className="about-skills__heading">
                <Code2 size={18} aria-hidden="true" />
                <h3>{t('about.technicalHeading')}</h3>
                <span>Technical skills</span>
              </div>
              <div className="about-technical-list">
                {technicalSkills.map(({ icon: Icon, titleKey, skills, descriptionKey }) => (
                  <article className="about-technical-card" key={titleKey}>
                    <div className="about-technical-card__icon"><Icon size={18} aria-hidden="true" /></div>
                    <div className="about-technical-card__body">
                      <h4>{t(titleKey)}</h4>
                      <ul className="about-skill-tags" aria-label={`Tecnologias e práticas: ${t(titleKey)}`}>
                        {skills.map((skill) => <li key={skill}>{skill}</li>)}
                      </ul>
                      <p>{t(descriptionKey)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="about-skills__soft">
              <div className="about-skills__heading">
                <UsersRound size={18} aria-hidden="true" />
                <h3>{t('about.softHeading')}</h3>
                <span>Soft skills</span>
              </div>
              <div className="about-soft-grid">
                {softSkills.map(({ icon: Icon, titleKey, descriptionKey }) => (
                  <article className="about-soft-card" key={titleKey}>
                    <Icon size={18} aria-hidden="true" />
                    <h4>{t(titleKey)}</h4>
                    <p>{t(descriptionKey)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-section about-philosophy" aria-labelledby="philosophy-title">
          <div className="about-section__heading">
            <div className="about-eyebrow"><span>04</span><span>{t('about.eyebrowPhilosophy')}</span></div>
          </div>
          <div className="about-philosophy__content">
            <span className="about-philosophy__mark" aria-hidden="true">“</span>
            <div>
              <h2 id="philosophy-title">{t('about.philosophyHeading')}</h2>
              <p>
                {t('about.philosophyBody')}
              </p>
              <span className="about-philosophy__signature">{t('about.philosophySignature')}</span>
            </div>
          </div>
        </section>

        <footer className="about-footer">
          <p>{t('about.footer')}</p>
        </footer>
      </main>
    </div>
  );
};

export default AboutMe;