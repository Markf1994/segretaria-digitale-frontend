import { render, screen } from '@testing-library/react'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

describe('InventoryPage', () => {
  it('opens modal on add', () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/inventario" element={<InventoryPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const addButtons = screen.getAllByText('Aggiungi')
    addButtons[0].click()
    expect(screen.getByTestId('dev-name')).toBeInTheDocument()
    expect(screen.getByText(/Segnaletica Verticale/)).toBeInTheDocument()
  })
})
