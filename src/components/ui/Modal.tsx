import React, { useEffect, useRef } from 'react'
import './modal.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      {title && <h3>{title}</h3>}
      {children}
    </dialog>
  )
}

export default Modal
