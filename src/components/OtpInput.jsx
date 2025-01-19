import React, { useRef, KeyboardEvent } from 'react';

// interface OtpInputProps {
//   length: number;
//   value: string[];
//   onChange: (otp: string[]) => void;
// }

export const OtpInput= ({ length, value, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, digit) => {
    if (digit.length > 1) return;
    
    const newOtp = [...value];
    newOtp[index] = digit;
    onChange(newOtp);

    if (digit !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && value[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      ))}
    </div>
  );
};