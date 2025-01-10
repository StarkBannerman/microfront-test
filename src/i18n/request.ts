import { getUserLocale } from '@/services/locale'
const getMessages = async () => {
  const locale = await getUserLocale()
  const messages = await import(`../translations/${locale}.json`)
  return {
    locale,
    messages: messages.default,
  }
}

export default getMessages
