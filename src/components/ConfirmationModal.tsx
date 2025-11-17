import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Yes',
  cancelText = 'No',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-center mb-2">{title}</DialogTitle>
          <DialogDescription className="text-center text-gray-600">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={onClose} className="px-6 py-3 text-lg rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className="px-6 py-3 text-lg rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal; 