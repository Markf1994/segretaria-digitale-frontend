import { render, screen } from '@testing-library/react'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

describe('InventoryPage', () => {
  it('renders forms', () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/inventario" element={<InventoryPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('dev-name')).toBeInTheDocument()
    expect(screen.getByTestId('temp-luogo')).toBeInTheDocument()
    expect(screen.getByText(/Segnaletica Verticale/)).toBeInTheDocument()
  })
})
