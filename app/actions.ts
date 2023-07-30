'use server'

import { square } from '@/clients/square'
import { redirect } from 'next/navigation'
import { log } from './helpers'

export const checkout = async (data: FormData) => {
  const link = await square.checkoutApi.createPaymentLink({
    order: {
      locationId: 'LMZ1D77E3HVRH',
      // customerId: '7D44X9294QETTXM2ZD9D25S0FR',
      lineItems: [
        {
          quantity: '1',
          catalogObjectId: data.get('product_variation_id') as string
        }
      ]
    },
  })
  log(link.result)
  // redirect(link.result.paymentLink.longUrl)
  return {
    link
  }
}