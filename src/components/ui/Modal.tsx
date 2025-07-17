import React from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null
  return (
    <div className="modal-backdrop" data-testid="modal-backdrop">
      <div role="dialog" className="modal" data-testid="modal">
        {children}
        <button type="button" onClick={onClose} aria-label="Close" className="hidden" />
      </div>
    </div>
  )
}

export default Modal
