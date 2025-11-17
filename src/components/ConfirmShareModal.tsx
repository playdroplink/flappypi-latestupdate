import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface ConfirmShareModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  question?: string;
}

const ConfirmShareModal: React.FC<ConfirmShareModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  question = 'Do you want to share your score to your friends?',
}) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Score</DialogTitle>
        </DialogHeader>
        <div className="text-lg text-center my-4">{question}</div>
        <DialogFooter className="flex justify-center gap-4">
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">Yes</Button>
          <Button onClick={onCancel} variant="outline">No</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmShareModal; 