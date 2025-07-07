import React from 'react';

interface SlotInputProps {
  label: string;
  startValue: string;
  endValue: string;
  onStartChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SlotInput: React.FC<SlotInputProps> = ({
  label,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}) => (
  <fieldset>
    <legend>{label}</legend>
    <input type="time" value={startValue} onChange={onStartChange} />
    <span>→</span>
    <input type="time" value={endValue} onChange={onEndChange} />
  </fieldset>
);

export default SlotInput;
