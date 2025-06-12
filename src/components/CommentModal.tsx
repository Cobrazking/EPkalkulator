import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: string;
  onSave: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  comment,
  onSave,
}) => {
  const [currentComment, setCurrentComment] = useState(comment);

  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  const handleSave = () => {
    onSave(currentComment);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-background-lighter border border-border p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 text-white flex justify-between items-center">
                  <span>Kommentar</span>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                  <textarea
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    className="w-full h-32 resize-none"
                    placeholder="Skriv din kommentar her..."
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onClose}
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSave}
                  >
                    Lagre
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommentModal;