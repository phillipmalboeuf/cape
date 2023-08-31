"use client"

// import { log } from '@/app/helpers'
import { FunctionComponent, useEffect, useState } from 'react'
import { CartProvider, Item, useCart } from 'react-use-cart'
import { CatalogObject } from 'square'
import { checkout, invoice } from '@/app/actions'
import { stringify } from '@/app/helpers'

export const Wrap: FunctionComponent<{ 
  id: string
  defaultItems?: Item[]
  children: React.ReactNode
}> = ({ children, id, defaultItems }) => {
  return <CartProvider id={id} defaultItems={defaultItems}>
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
      }, parseFloat(data.get('quantity') as string))
    }}>
      {/* <input type='hidden' name='product_variation_id' value={product.itemData.variations[0].id} /> */}
      {product.itemData.variations.map(variation => <label key={variation.id}>
        <input type='radio' name='product_variation_id' value={variation.id} />
        {variation.itemVariationData.name}
      </label>)}

      <input type='number' name='quantity' defaultValue={1.0} step={0.1} />
      
      <button type='submit'>Add to Cart</button>
    </form>
}

export const Cart: FunctionComponent<{
  action: (formData: FormData) => void
  label?: string
}> = ({ action, label }) => {
  
  const { id, items, removeItem, updateItemQuantity } = useCart()
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

    <form action={action}>
      <input type='hidden' name='id' value={id} />
      <input type='hidden' name='items' value={JSON.stringify(items)} />
      <Submit label={label} />
    </form>
  </> : null
}

import { experimental_useFormStatus as useFormStatus } from 'react-dom'
 
const Submit: FunctionComponent<{
  label?: string
}> = ({ label }) => {
  const { pending } = useFormStatus()
 
  return <button type='submit'
      style={pending ? { opacity: 0.33 } : {}}
      disabled={pending}
    >{label || 'Submit'}</button>
}