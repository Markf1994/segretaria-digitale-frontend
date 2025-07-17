import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

describe('InventoryPage', () => {
  it('opens modal via Aggiungi button and allows save/cancel', async () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/inventario" element={<InventoryPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('dev-add')).toBeInTheDocument()
    expect(screen.getByTestId('temp-add')).toBeInTheDocument()
    expect(screen.getByTestId('vert-add')).toBeInTheDocument()
    expect(screen.getByTestId('hor-add')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('dev-add'))
    expect(screen.getByTestId('dev-name')).toBeInTheDocument()

    await userEvent.type(screen.getByTestId('dev-name'), 'pc')
    await userEvent.type(screen.getByTestId('dev-notes'), 'note')
    await userEvent.click(screen.getByTestId('dev-submit'))

    const stored = JSON.parse(localStorage.getItem('devices') || '[]')
    expect(stored[0].nome).toBe('pc')
    expect(screen.queryByTestId('dev-name')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('dev-add'))
    expect(screen.getByTestId('dev-cancel')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('dev-cancel'))
    expect(screen.queryByTestId('dev-name')).not.toBeInTheDocument()
  })
})
