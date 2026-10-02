import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import { setPageMeta } from './lib/seo'

const Explore = lazy(() => import('./pages/Explore'))
const About = lazy(() => import('./pages/About'))
const Sources = lazy(() => import('./pages/Sources'))
const CharacterDetail = lazy(() => import('./pages/CharacterDetail'))
const CharacterRelations = lazy(() => import('./pages/CharacterRelations'))
const Games = lazy(() => import('./pages/Games'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Learn = lazy(() => import('./pages/Learn'))
const Profile = lazy(() => import('./pages/Profile'))
const WordBook = lazy(() => import('./pages/WordBook'))
const Admin = lazy(() => import('./pages/Admin'))
const Studio = lazy(() => import('./pages/Studio'))

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" style={{ background: '#F5F0E8' }}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2"
        style={{ borderColor: 'rgba(139,105,20,0.2)', borderTopColor: '#8B6914' }}
      />
    </div>
  )
}

/** 按路由同步 document.title / meta（详情页自行覆盖为字级标题）。 */
function RouteMeta() {
  const location = useLocation()
  const { t } = useLanguage()
  useEffect(() => {
    const path = location.pathname === '' ? '/' : location.pathname
    const title = t(`titles.${path}`) !== `titles.${path}` ? t(`titles.${path}`) : t('titles./')
    setPageMeta({ title })
  }, [location.pathname, t])
  return null
}

export default function App() {
  const location = useLocation()
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouteMeta />
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} {...pageTransition}>
              <Suspense fallback={<PageFallback />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sources" element={<Sources />} />
                  <Route path="/detail" element={<CharacterDetail />} />
                  <Route path="/relations" element={<CharacterRelations />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wordbook" element={<WordBook />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/studio" element={<Studio />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </Layout>
      </AuthProvider>
    </LanguageProvider>
  )
}
