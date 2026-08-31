import {
  buildDefaultSellerQuestions,
  formatSellerAnswerDate,
  type SellerProductQuestion,
} from '~/data/seller-questions'

export function useSellerQuestions() {
  const items = useState<SellerProductQuestion[]>('seller-product-questions', () => [])
  const seeded = useState('seller-product-questions-seeded', () => false)

  const questions = computed(() => items.value)

  const unansweredCount = computed(
    () => items.value.filter(q => !q.answer).length,
  )

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultSellerQuestions()
      seeded.value = true
    }
    return items.value
  }

  function getById(id: string) {
    return items.value.find(q => q.id === id)
  }

  function replyToQuestion(id: string, text: string, author = 'کارشناس دیجی‌شاپ') {
    const trimmed = text.trim()
    if (!trimmed) {
      return { ok: false as const, error: 'متن پاسخ خالی است' }
    }
    const index = items.value.findIndex(q => q.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'پرسش پیدا نشد' }
    }
    const copy = [...items.value]
    copy[index] = {
      ...copy[index]!,
      answer: {
        author,
        date: formatSellerAnswerDate(),
        text: trimmed,
      },
    }
    items.value = copy
    return { ok: true as const, question: copy[index]! }
  }

  function clearAnswer(id: string) {
    const index = items.value.findIndex(q => q.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'پرسش پیدا نشد' }
    }
    const copy = [...items.value]
    copy[index] = { ...copy[index]!, answer: null }
    items.value = copy
    return { ok: true as const, question: copy[index]! }
  }

  function setVerified(id: string, verified: boolean) {
    const index = items.value.findIndex(q => q.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'پرسش پیدا نشد' }
    }
    const copy = [...items.value]
    copy[index] = { ...copy[index]!, verified }
    items.value = copy
    return { ok: true as const, question: copy[index]! }
  }

  function deleteQuestion(id: string) {
    if (!items.value.some(q => q.id === id)) {
      return { ok: false as const, error: 'پرسش پیدا نشد' }
    }
    items.value = items.value.filter(q => q.id !== id)
    return { ok: true as const }
  }

  return {
    questions,
    items,
    unansweredCount,
    seeded,
    ensureLoaded,
    getById,
    replyToQuestion,
    clearAnswer,
    setVerified,
    deleteQuestion,
  }
}
