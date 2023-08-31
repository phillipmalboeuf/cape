import Image from 'next/image'
import styles from '@/styles/1.page.module.scss'
import { square } from '@/clients/square'
import { checkout, customer, login, logout, signup } from './actions'
import { AddToCart, Cart, Wrap } from '@/components/Cart'
import { log } from './helpers'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Subscriptions } from '@/components/Subscription'

export default async function Home() {
  const items = await square.catalogApi.searchCatalogItems({
    // productTypes: ['REGULAR']
  })

  const butter = await square.catalogApi.retrieveCatalogObject('WV3ZWKSWP5AGKBZOA7F2TLQF')
  const me = cookies().get('customer')?.value
    ? await square.customersApi.retrieveCustomer(cookies().get('customer').value)
    : undefined

  return (
    <main className={styles.main}>
      <Nav />
      <h1>À la Coopérative pour l'Agriculture de Proximité Écologique</h1>

      {me
      ? <>
        <p>Hi {me.result.customer.givenName}</p>
        <Subscriptions me={me.result.customer} />
        <form action={logout}>
          <button>Logout</button>
        </form>
      </>
      : <>
      <form action={signup}>
        <input name='password' type='password' autoComplete='new-password' />
        <button>Signup</button>
      </form>

      <form action={login}>
        <input name='password' type='password' />
        <button>Login</button>
      </form>
      </>}

      <Wrap id='new'>
      <ol>
        {items.result.items?.map(product => <li key={product.id}>
          <h3>{product.itemData.name}</h3>
          <p>{product.itemData.descriptionPlaintext}</p>
          <AddToCart product={product} />
        </li>)}
      </ol>
      <Cart action={checkout} label='Checkout' />
      </Wrap>
      <h2>{butter.result.object?.itemData?.name}</h2>
    </main>
  )
}
