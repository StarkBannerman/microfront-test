import Header from '../components/Header'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('HomePage')
  return (
    <div>
      <Header />
      <main className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold">Welcome to the Main App</h1>
        <h1>{t('title')}</h1>
      </main>
    </div>
  )
}
