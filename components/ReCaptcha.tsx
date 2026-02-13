import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (verified || loading) return;
    setLoading(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      onVerify("simulated-recaptcha-token-mock-12345");
    }, 800);
  };

  return (
    <div className="flex justify-center my-4">
      <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] shadow-[0_1px_1px_rgba(0,0,0,0.08)] flex items-center px-3 justify-between select-none">
        <div className="flex items-center gap-3">
          <div 
            onClick={handleVerify}
            className={`w-[24px] h-[24px] bg-white border-2 ${verified ? 'border-transparent' : 'border-[#c1c1c1]'} rounded-[2px] flex items-center justify-center cursor-pointer hover:border-[#b2b2b2] transition-colors relative`}
          >
             {loading && (
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#4A90E2]"></div>
             )}
             {verified && (
               <Check strokeWidth={4} className="w-5 h-5 text-[#009688]" />
             )}
          </div>
          <span className="text-[14px] font-normal text-[#282828] font-sans">I'm not a robot</span>
        </div>
        
        <div className="flex flex-col items-center justify-center pointer-events-none opacity-70">
           <img 
             src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
             alt="reCAPTCHA logo"
             className="w-8 h-8 object-contain" 
           />
           <div className="text-[10px] text-[#555] mt-0.5 text-center leading-tight font-sans">
             reCAPTCHA<br/>
             <span className="text-[8px] hover:underline cursor-pointer">Privacy</span> - <span className="text-[8px] hover:underline cursor-pointer">Terms</span>
           </div>
        </div>
      </div>
    </div>
  );
};