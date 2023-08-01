'use server'

import { square } from '@/clients/square'
import { redirect } from 'next/navigation'
import { DateTime } from 'luxon'
import { log } from './helpers'
import { Item } from 'react-use-cart'

export const buy = async (data: FormData) => {
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

export const invoice = async (data: FormData) => {
  const items: Item[] = JSON.parse(data.get('items') as string)
  const order = await square.ordersApi.createOrder({
    order: {
      locationId: 'LMZ1D77E3HVRH',
      // customerId: '7D44X9294QETTXM2ZD9D25S0FR',
      lineItems: items.map(item => (
        {
          quantity: item.quantity.toString(),
          catalogObjectId: item.id
        }
      ))
    },
  })
  log(order)

  const invoice = await square.invoicesApi.createInvoice({
    invoice: {
      locationId: 'LMZ1D77E3HVRH',
      orderId: order.result.order.id,
      primaryRecipient: {
        customerId: '7D44X9294QETTXM2ZD9D25S0FR'
      },
      paymentRequests: [
        {
          requestType: 'BALANCE',
          dueDate: DateTime.now().plus({ days: 15 }).toISODate(),
          reminders: [
            {
              relativeScheduledDays: -3,
              message: 'Upcoming'
            }
          ]
        }
      ],
      deliveryMethod: 'EMAIL',
      acceptedPaymentMethods: {
        card: true,
        squareGiftCard: true,
        bankAccount: true,
        buyNowPayLater: true
      },
      storePaymentMethodEnabled: true
    }
  })
  log(invoice)

  const publish = await square.invoicesApi.publishInvoice(invoice.result.invoice.id, {
    version: invoice.result.invoice.version
  })

  log(publish)
  
  redirect(publish.result.invoice.publicUrl)
  // return {
  //   link
  // }
}


export const checkout = async (data: FormData) => {
  const items: Item[] = JSON.parse(data.get('items') as string)
  const link = await square.checkoutApi.createPaymentLink({
    order: {
      locationId: 'LMZ1D77E3HVRH',
      // customerId: '7D44X9294QETTXM2ZD9D25S0FR',
      lineItems: items.map(item => (
        {
          quantity: item.quantity.toString(),
          catalogObjectId: item.id
        }
      ))
    },
    checkoutOptions: {
      merchantSupportEmail: 'info@cape.coop',
    }
  })
  log(link.result)
  redirect(link.result.paymentLink.longUrl)
  // return {
  //   link
  // }
}