import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  { q: 'What is Flappy Pi?', a: 'Flappy Pi is a Pi Network-powered Flappy Bird game where you can play, earn Pi coins, and compete with friends.' },
  { q: 'How do I earn Pi?', a: 'You earn Pi by playing the game, completing challenges, and participating in events.' },
  { q: 'Is Flappy Pi free to play?', a: 'Yes! Flappy Pi is free to play for everyone.' },
  { q: 'How do I contact support?', a: 'You can contact support using the Contact modal in the footer.' },
  { q: 'Where can I find the Privacy Policy?', a: 'The Privacy Policy is available in the footer and in the Privacy modal.' },
  { q: 'How do I join the community?', a: 'Join us on Discord, Telegram, Twitter, and more! Links are in the footer.' },
];

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
      <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
        <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Frequently Asked Questions</DialogTitle>
      </DialogHeader>
      <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-6">
        {faqs.map((faq, i) => (
          <div key={i}>
            <div className="font-semibold text-blue-700 mb-1">Q: {faq.q}</div>
            <div className="ml-4">A: {faq.a}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 px-8 pb-6">
        <button onClick={onClose} className="w-full text-lg bg-blue-600 text-white rounded-xl py-2 font-bold hover:bg-blue-700 transition">Close</button>
      </div>
    </DialogContent>
  </Dialog>
);

export default FAQModal; 