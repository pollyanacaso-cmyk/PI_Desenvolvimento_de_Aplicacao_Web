import { HelpCircle } from 'lucide-react';

export function HelpButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="w-10 h-10 bg-[#2c2825] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#a3644f] transition-all">
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
}