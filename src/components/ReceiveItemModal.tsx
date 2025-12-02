import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getItemImage } from '@/utils/itemImageMapping';

interface ReceiveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    quantity?: number;
    image?: string;
  } | null;
  onGoToInventory: () => void;
}

const ReceiveItemModal: React.FC<ReceiveItemModalProps> = ({ isOpen, onClose, item, onGoToInventory }) => {
  if (!isOpen || !item) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 mb-2">🎁 Item Received!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center my-4">
          {item.image && <img src={item.image || getItemImage(item.id)} alt={item.name} className="w-24 h-24 mb-3 drop-shadow-xl animate-bounce-slow" />}
          <div className="text-xl font-bold mb-2 text-gray-800">{item.name}</div>
          {item.quantity && item.quantity > 1 && (
            <div className="text-lg font-semibold text-purple-700 mb-2">x{item.quantity}</div>
          )}
        </div>
        <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg mt-2">Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveItemModal; 