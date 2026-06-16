'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How do I open an investment account with Elite Capital?',
    answer: 'Account opening is 100% digital and paperless. Simply click the "Explore Stocks" or "Get Started" buttons, sign up with your email, submit your PAN card, and link your bank account to start investing in under 5 minutes.',
  },
  {
    question: 'What are the account opening and maintenance charges?',
    answer: 'Opening an account is absolutely free. There are zero account maintenance fees. We operate on a flat fee structure with standard low direct brokerage rates on equity delivery and F&O.',
  },
  {
    question: 'Are my investments and money safe with Elite Capital?',
    answer: 'Absolutely. Elite Capital is registered with SEBI and is an active member of NSE, BSE, and CDSL. Your shares are safely deposited in your CDSL demat account, and your money is processed via secure, bank-grade encryption.',
  },
  {
    question: 'What documents are required to complete KYC?',
    answer: 'To complete your KYC online, you will need: 1) Your PAN card, 2) Aadhaar card (linked to your mobile number for e-signing), and 3) A scanned copy of a canceled cheque or bank statement as proof of banking.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-12 md:py-16 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-sm">
            Quick answers to help you navigate your trading and mutual fund journeys
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl bg-[#FAFBFB] dark:bg-[#161618] overflow-hidden transition-all duration-300"
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-[#1A1A1A] dark:text-white text-base md:text-lg focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <div className="flex-shrink-0 ml-4 w-6 h-6 rounded-full bg-white dark:bg-[#202022] border border-[#E8E8E8] dark:border-[#2D2D30] flex items-center justify-center text-[#44C2A4]">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed border-t border-[#E8E8E8]/60 dark:border-[#2A2A2A]/60 pt-3 bg-white dark:bg-[#161618]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
