"use client"

// import { log } from '@/app/helpers'
import { FunctionComponent, useEffect, useState } from 'react'
import { CartProvider, useCart } from 'react-use-cart'
import { CatalogObject } from 'square'
import { checkout, invoice } from '@/app/actions'

export const Wrap: FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  return <CartProvider>
    {children}
  </CartProvider>
}

export const AddToCart: FunctionComponent<{
  product: CatalogObject
}> = ({ product }) => {
  const { addItem } = useCart()
  
  return <form key={product.id} action={(data) => {
      addItem({
        id: product.itemData.variations[0].id,
        price: Number(product.itemData.variations[0].itemVariationData.priceMoney.amount),
        name: product.itemData.name
      }, 1)
    }}>
      <input type='hidden' name='product_variation_id' value={product.itemData.variations[0].id} />
      <button type='submit'>Add to Cart</button>
    </form>
}

export const Cart: FunctionComponent<{
}> = ({ }) => {
  
  const { items, removeItem, updateItemQuantity } = useCart()
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <>
    <ol>
      {items.map(item => <li key={item.id}>
        {[item.name, item.id, item.quantity].join(' / ')}
        <button type='button' onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>–</button> <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
      </li>)}
    </ol>

    <form action={checkout}>
      <input type='hidden' name='items' value={JSON.stringify(items)} />
      <button type='submit'>Checkout</button>
    </form>

    <form action={invoice}>
      <input type='hidden' name='items' value={JSON.stringify(items)} />
      <button type='submit'>Invoice</button>
    </form>
  </> : null
}