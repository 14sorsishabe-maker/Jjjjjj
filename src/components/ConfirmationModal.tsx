import React from 'react';
import { ShieldAlert, PhoneCall, MessageSquare, AlertTriangle, Check, X } from 'lucide-react';
import { ActionPayload } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  action: ActionPayload | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  action,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !action) return null;

  const isCall = action.type === 'CALL';
  const isSms = action.type === 'SMS';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden text-slate-100 p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {isCall ? (
              <PhoneCall className="w-5 h-5 text-blue-400" />
            ) : isSms ? (
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">कार्रवाई की पुष्टि (Confirmation)</h3>
            <p className="text-[11px] text-slate-400">सुरक्षा नियम: आपकी स्वीकृति आवश्यक है</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 text-xs flex flex-col gap-2">
          <div className="text-pink-300 font-semibold">{action.description}</div>

          {action.params?.phoneNumber && (
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">फ़ोन नंबर:</span>
              <span className="font-mono text-cyan-300">{action.params.phoneNumber}</span>
            </div>
          )}

          {action.params?.message && (
            <div className="flex flex-col gap-1 text-slate-300 border-t border-purple-500/10 pt-2">
              <span className="text-slate-400 text-[10px]">संदेश सामग्री:</span>
              <span className="italic bg-slate-900 p-2 rounded text-slate-200 text-[11px]">
                "{action.params.message}"
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          क्या आप चाहते हैं कि यास्मीन यह कमांड पूरी करे?
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <X className="w-4 h-4" />
            रद्द करें (Cancel)
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold transition-all shadow-md"
          >
            <Check className="w-4 h-4" />
            हाँ, आगे बढ़ें (Confirm)
          </button>
        </div>
      </div>
    </div>
  );
};
