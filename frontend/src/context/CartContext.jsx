import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = useCallback(() => {
    if (!isAuthenticated) { setCartCount(0); return }
    api.get('/cart')
      .then(res => setCartCount(res.data.data.cart.items?.length || 0))
      .catch(() => setCartCount(0))
  }, [isAuthenticated])

  useEffect(() => { refreshCart() }, [refreshCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
