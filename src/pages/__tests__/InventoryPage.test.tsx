import { render, screen, within } from '@testing-library/react'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

describe('InventoryPage', () => {
  it('opens modal', async () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/inventario" element={<InventoryPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const devicesSection = screen.getByText('Dispositivi').parentElement as HTMLElement
    await userEvent.click(within(devicesSection).getByRole('button', { name: /aggiungi/i }))

    expect(screen.getByTestId('dev-name')).toBeInTheDocument()
    expect(screen.getByText(/Segnaletica Verticale/)).toBeInTheDocument()
  })
})
