import Image from 'next/image'
import styles from '@/styles/1.page.module.scss'
import { square } from '@/clients/square'
import { checkout } from './actions'
import { AddToCart, Cart, Wrap } from '@/components/Cart'

export default async function Home() {
  const items = await square.catalogApi.searchCatalogItems({
    // productTypes: ['REGULAR']
  })

  const butter = await square.catalogApi.retrieveCatalogObject('WV3ZWKSWP5AGKBZOA7F2TLQF')

  return (
    <main className={styles.main}>
      <h1>À la Coopérative pour l'Agriculture de Proximité Écologique</h1>
      <Wrap>
      <ol>
        {items.result.items?.map(product => <li key={product.id}>
          <h3>{product.itemData.name}</h3>
          <p>{product.itemData.descriptionPlaintext}</p>
          <AddToCart product={product} />
        </li>)}
      </ol>
      <Cart />
      </Wrap>
      <h2>{butter.result.object?.itemData?.name}</h2>
    </main>
  )
}
