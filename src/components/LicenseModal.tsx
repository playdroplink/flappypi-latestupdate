import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">PiOS License</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            Official PiOS License for Flappy Pi by MRWAIN ORGANIZATION
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-indigo-700 bg-indigo-100 border-indigo-200 mb-2">
            <FileText className="w-4 h-4 mr-1" /> Legal Notice
          </Badge>
        </DialogHeader>

        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4 leading-relaxed">
          <p><strong>Copyright (C) 2025 MRWAIN ORGANIZATION</strong></p>

          <p>
            Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.
          </p>

          <p>
            For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate. However, you are prohibited from using any portion of the Software or any derivative works thereof in any manner (a) which infringes on any Pi Network intellectual property rights, (b) to hack any of Pi Network’s systems or processes or (c) to develop any product or service which is competitive with the Pi Network.
          </p>

          <p>
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
          </p>

          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <p>
            Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 px-8 pb-6">
          <Button variant="default" size="lg" onClick={onClose} className="w-full text-lg">Close</Button>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-4">Powered by Pi Network</div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseModal;


