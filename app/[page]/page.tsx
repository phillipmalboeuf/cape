import Image from 'next/image'
import styles from '@/styles/1.page.module.scss'
import { square } from '@/clients/square'
// import { AddToCart, Cart, Wrap } from '@/components/Cart'
import { cookies } from 'next/headers'
import { Nav } from '@/components/Nav'

export default async function Page({ params }) {
  return (
    <main className={styles.main}>
      <Nav />
      <h1>{params.page}</h1>
    </main>
  )
}
