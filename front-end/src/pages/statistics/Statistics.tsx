import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { StatCard } from '@/components/wakatime/StatCard';
import { LanguageBar } from '@/components/wakatime/LanguageBar';
import { getWakatimeStats } from '@/services/wakatimeService';
import type { WakaTimeStatsResponse, WakaTimeRange } from '@/types/Wakatime';
import { Clock, TrendingUp, Calendar, Code, FolderGit2, Monitor, RefreshCw } from 'lucide-react';
import './statistics.css';

interface StatisticsProps {
  language?: 'pt' | 'en';
}

export default function Statistics({ language = 'pt' }: StatisticsProps) {
  const [range, setRange] = useState<WakaTimeRange>('last_30_days');
  const [stats, setStats] = useState<WakaTimeStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPt = language === 'pt';

  const fetchData = async (selectedRange: WakaTimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await getWakatimeStats(selectedRange);
      setStats(statsRes);
    } catch {
      setError(
        isPt
          ? 'Não foi possível carregar as métricas do Wakatime. Certifique-se de que o backend está ativo.'
          : 'Could not load Wakatime metrics at this moment. Ensure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  return (
    <div className="statistics-page">
      <Navbar title={isPt ? "Estatísticas" : "Statistics"} />
      <div className="statistics-page__backdrop" aria-hidden="true" />

      <main className="statistics-page__main">
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-amber-900/40 bg-amber-950/20 text-amber-500 font-cinzel text-xs tracking-widest uppercase">
            <span>{isPt ? 'Grimório de Codificação' : 'Coding Grimoire'}</span>
          </div>

          <h1 className="font-cinzel text-3xl md:text-5xl text-zinc-100 font-bold tracking-wider mb-4">
            {isPt ? 'Métricas & Produtividade' : 'Metrics & Productivity'}
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-400 text-sm md:text-base leading-relaxed">
            {isPt
              ? 'Dados de atividade de desenvolvimento em tempo real rastreados via WakaTime API, evidenciando consistência técnica, dedicação acumulada e foco em linguagens modernas.'
              : 'Real-time coding analytics tracked via WakaTime API, demonstrating engineering consistency, lifetime dedication, and modern language expertise.'}
          </p>

          <div className="flex items-center justify-center gap-2 mt-8" role="radiogroup">
            <button
              onClick={() => setRange('last_30_days')}
              className={`range-btn ${range === 'last_30_days' ? 'range-btn--active' : 'range-btn--inactive'}`}
            >
              {isPt ? 'Últimos 30 dias' : 'Last 30 days'}
            </button>
            <button
              onClick={() => setRange('all_time')}
              className={`range-btn ${range === 'all_time' ? 'range-btn--active' : 'range-btn--inactive'}`}
            >
              {isPt ? 'Todo o período' : 'All time'}
            </button>
          </div>
        </header>

        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0,1,2].map(i => <div key={i} className="h-28 bg-zinc-800/50 animate-pulse rounded-sm" />)}
            </div>
            <div className="h-40 bg-zinc-800/50 animate-pulse rounded-sm" />
          </div>
        )}

        {!loading && error && (
          <div className="max-w-xl mx-auto p-6 border border-red-900/40 bg-red-950/20 text-center rounded-sm">
            <p className="text-red-400 text-sm font-sans mb-3">{error}</p>
            <button
              onClick={() => fetchData(range)}
              className="inline-flex items-center gap-2 text-xs font-cinzel text-amber-500 hover:text-amber-400 uppercase tracking-wider"
            >
              <RefreshCw size={14} />
              {isPt ? 'Tentar novamente' : 'Try again'}
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="space-y-10">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Clock}
                label={isPt ? 'Tempo Total' : 'Total Time'}
                value={stats.overview.totalTimeText || '—'}
                subtext={isPt ? 'No período' : 'In period'}
              />
              <StatCard
                icon={Calendar}
                label={isPt ? 'Média Diária' : 'Daily Average'}
                value={stats.overview.dailyAverageText || '—'}
                subtext={isPt ? 'Constância' : 'Consistency'}
              />
              <StatCard
                icon={TrendingUp}
                label={isPt ? 'Dias Ativos' : 'Active Days'}
                value={String(stats.overview.activeDays)}
                subtext={stats.overview.topProject ? `${stats.overview.topProject.name}` : '—'}
              />
            </div>

            {/* AI-Assisted Engineering (condicional) */}
            {stats.aiMetrics.hasAiData && (
              <div className="statistics-panel">
                <h2 className="font-cinzel text-xl text-zinc-100 font-semibold tracking-wide mb-4">
                  {isPt ? 'Engenharia Assistida por IA' : 'AI-Assisted Engineering'}
                </h2>
                <p className="text-zinc-400 text-sm mb-4">
                  {isPt ? 'Compartilhamento de código por IA:' : 'AI code share:'} {stats.aiMetrics.aiSharePercent.toFixed(0)}%
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>AI +{stats.aiMetrics.aiAdditions} / -{stats.aiMetrics.aiDeletions}</div>
                  <div>Humano +{stats.aiMetrics.humanAdditions} / -{stats.aiMetrics.humanDeletions}</div>
                </div>
                <ul className="mt-4 space-y-2">
                  {stats.aiMetrics.tools.map(t => (
                    <li key={t.name} className="flex justify-between text-xs font-mono text-zinc-300">
                      <span>{t.name}</span>
                      <span>{t.timeText} ({t.percent.toFixed(0)}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stack Técnica */}
            <div className="statistics-panel">
              <div className="flex items-center gap-3 mb-5">
                <Code size={20} className="text-amber-500" />
                <h2 className="font-cinzel text-xl text-zinc-100 font-semibold tracking-wide">
                  {isPt ? 'Stack Técnica' : 'Tech Stack'}
                </h2>
              </div>
              <div className="space-y-4">
                {stats.languages.slice(0, 8).map((lang, idx) => (
                  <LanguageBar
                    key={lang.name}
                    name={lang.name}
                    percent={lang.percent}
                    text={lang.timeText}
                    rankIndex={idx}
                  />
                ))}
              </div>
            </div>

            {/* Projetos & Entregas */}
            <div className="statistics-panel">
              <div className="flex items-center gap-3 mb-5">
                <FolderGit2 size={18} className="text-amber-500" />
                <h3 className="font-cinzel text-lg text-zinc-100 font-semibold tracking-wide">
                  {isPt ? 'Projetos & Entregas' : 'Projects & Deliveries'}
                </h3>
              </div>
              <div>
                {stats.projects.length > 0 ? (
                  stats.projects.slice(0, 8).map((proj) => (
                    <div key={proj.name} className="stat-list-row">
                      <span className="font-mono text-sm text-zinc-300 truncate pr-4">
                        {proj.name}{proj.isPrivate ? ' (privado)' : ''}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <span>{proj.timeText}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-amber-500/90 font-semibold">{proj.percent.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs font-mono">
                    {isPt ? 'Nenhum projeto registrado no período.' : 'No projects logged for this period.'}
                  </p>
                )}
              </div>
            </div>

            {/* Consistência / Ambiente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="statistics-panel">
                <div className="flex items-center gap-3 mb-5">
                  <Monitor size={18} className="text-amber-500" />
                  <h3 className="font-cinzel text-lg text-zinc-100 font-semibold tracking-wide">
                    {isPt ? 'Ambientes' : 'Environments'}
                  </h3>
                </div>
                <div>
                  {stats.environment.editors.length > 0 ? (
                    stats.environment.editors.slice(0, 6).map((ed) => (
                      <div key={ed.name} className="stat-list-row">
                        <span className="font-mono text-sm text-zinc-300">{ed.name}</span>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span>{ed.timeText}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-amber-500/90 font-semibold">{ed.percent.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-xs font-mono">{isPt ? 'Nenhum editor.' : 'No editors.'}</p>
                  )}
                </div>
              </div>
              <div className="statistics-panel">
                <h3 className="font-cinzel text-lg text-zinc-100 font-semibold tracking-wide mb-5">
                  {isPt ? 'Sistemas Operacionais' : 'Operating Systems'}
                </h3>
                <div>
                  {stats.environment.operatingSystems.length > 0 ? (
                    stats.environment.operatingSystems.slice(0, 6).map((os) => (
                      <div key={os.name} className="stat-list-row">
                        <span className="font-mono text-sm text-zinc-300">{os.name}</span>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span>{os.timeText}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-amber-500/90 font-semibold">{os.percent.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-xs font-mono">{isPt ? 'Nenhum SO.' : 'No OS.'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}