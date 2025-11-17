import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Mail, MessageSquare, Send, Globe, Users, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import ImageWithFallback from '@/components/ImageWithFallback';
import EnhancedFooter from '../components/EnhancedFooter';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';


const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
      duration: 3000,
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
      <BackgroundDecoration />
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Contact Us</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Have a question or feedback? We'd love to hear from you!</p>
        <div className="bg-white/60 shadow-lg p-8 w-full text-blue-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Name <span className="text-red-500">*</span></label>
                <Input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Your name" required className="bg-white border-blue-200 text-blue-900 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Email <span className="text-red-500">*</span></label>
                <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="your@email.com" required className="bg-white border-blue-200 text-blue-900 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Subject</label>
              <Input type="text" value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} placeholder="What's this about? (Optional)" className="bg-white border-blue-200 text-blue-900 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Message <span className="text-red-500">*</span></label>
              <Textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Tell us what's on your mind..." required className="bg-white border-blue-200 text-blue-900 focus:ring-blue-500 focus:border-blue-500 h-32" />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-all duration-300 shadow-md">Send Message</Button>
          </form>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
              <div className="flex items-center space-x-3 text-blue-800">
                <Mail className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Email Support</h3>
                  <p className="text-sm">support@flappypi.fun</p>
                  <p className="text-sm">flappypi.fun@gmail.com</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200 shadow-sm">
              <div className="flex items-center space-x-3 text-green-800">
                <Globe className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Website</h3>
                  <p className="text-sm">mrwain.org</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Contact FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-blue-200">
                <AccordionTrigger className="text-blue-800 font-semibold">How quickly will you respond to my message?</AccordionTrigger>
                <AccordionContent className="text-blue-700">We typically respond within 24-48 hours during business days. For urgent technical issues, we aim to respond within 4-6 hours.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-blue-200">
                <AccordionTrigger className="text-blue-800 font-semibold">What information should I include for bug reports?</AccordionTrigger>
                <AccordionContent className="text-blue-700">Please include your device type, browser version, a description of what happened, what you expected to happen, and steps to reproduce the issue if possible.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-blue-200">
                <AccordionTrigger className="text-blue-800 font-semibold">Can you help with Pi Network payment issues?</AccordionTrigger>
                <AccordionContent className="text-blue-700">We can help with issues within our game, but Pi Network wallet or transaction problems should be directed to Pi Network support first.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-blue-200">
                <AccordionTrigger className="text-blue-800 font-semibold">Do you offer phone support?</AccordionTrigger>
                <AccordionContent className="text-blue-700">Currently, we only offer email support. This allows us to better track issues and provide detailed responses with screenshots when needed.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Card className="w-full mt-10 p-6 bg-purple-50 border-purple-200 shadow-sm text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">Join Our Community</h3>
            <p className="text-sm text-purple-600 mb-4">Connect with other Flappy Pi players and stay updated on the latest features.</p>
            <p className="text-xs text-purple-500">Community features coming soon!</p>
          </Card>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  );
};

export default ContactPage;
