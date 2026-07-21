import type { CreateTemplatePayload, TemplateCategory } from '@/types'

export interface StarterTemplate {
  id: string
  title: string
  description: string
  category: TemplateCategory
  payload: CreateTemplatePayload
}

// Ready-made templates offered on the WhatsApp setup completion screen so a
// new user can submit something for Meta review in one click instead of
// building a template from scratch.
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'welcome_greeting',
    title: 'Welcome message',
    description: 'Greet a customer the first time they connect with you',
    category: 'UTILITY',
    payload: {
      name: 'welcome_greeting',
      category: 'UTILITY',
      language: 'en_US',
      body: "Hi {{1}}, welcome to {{2}}! We're here to help with orders, support and updates. Reply anytime.",
      footer: 'Reply STOP to opt out',
      sampleVariables: { '1': 'Priya', '2': 'our store' },
    },
  },
  {
    id: 'order_confirmation',
    title: 'Order confirmation',
    description: 'Confirm an order and give the customer a delivery estimate',
    category: 'UTILITY',
    payload: {
      name: 'order_confirmation',
      category: 'UTILITY',
      language: 'en_US',
      body: 'Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}. Thank you for shopping with us!',
      sampleVariables: { '1': 'Priya', '2': '10234', '3': '20 Jul' },
    },
  },
  {
    id: 'appointment_reminder',
    title: 'Appointment reminder',
    description: 'Remind a customer about an upcoming appointment',
    category: 'UTILITY',
    payload: {
      name: 'appointment_reminder',
      category: 'UTILITY',
      language: 'en_US',
      body: 'Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Reply YES to confirm or call us to reschedule.',
      sampleVariables: { '1': 'Priya', '2': '22 Jul', '3': '4:00 PM' },
    },
  },
  {
    id: 'special_offer',
    title: 'Special offer',
    description: 'Announce a promotion or discount to your customers',
    category: 'MARKETING',
    payload: {
      name: 'special_offer',
      category: 'MARKETING',
      language: 'en_US',
      body: 'Hi {{1}}, enjoy {{2}}% off your next purchase! Use code {{3}} at checkout. Offer valid till {{4}}.',
      footer: 'Reply STOP to opt out',
      sampleVariables: { '1': 'Priya', '2': '20', '3': 'SAVE20', '4': '31 Jul' },
    },
  },
]
