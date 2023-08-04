import Link from 'next/link'
import { FunctionComponent } from 'react'

export const Nav: FunctionComponent<{
}> = ({ }) => {
  return <nav>
    <Link href={'/'}>Home</Link>
    <Link href={'/about'}>About</Link>
  </nav>
}