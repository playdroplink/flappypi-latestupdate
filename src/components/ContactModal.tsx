import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would handle sending the message (API, email, etc.)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Contact Us</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm">
          {submitted ? (
            <div className="text-green-600 font-semibold text-lg text-center py-8">Thank you for your message! We will get back to you soon.</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <textarea
                placeholder="Your Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button type="submit" className="w-full text-lg bg-blue-600 text-white rounded-xl py-2 font-bold hover:bg-blue-700 transition">Send Message</button>
            </form>
          )}
        </div>
        <div className="flex flex-col gap-2 px-8 pb-6">
          <button onClick={onClose} className="w-full text-lg bg-gray-200 text-gray-800 rounded-xl py-2 font-bold hover:bg-gray-300 transition">Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
