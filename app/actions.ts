'use server'

import { square } from '@/clients/square'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { DateTime } from 'luxon'
import { hashPassword, log } from './helpers'
import { Item } from 'react-use-cart'
import { revalidatePath, revalidateTag } from 'next/cache'

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
  log(link)
  redirect(link.result.paymentLink.longUrl)
  // return {
  //   link
  // }
}

export const update = async (data: FormData) => {
  const items: Item[] = JSON.parse(data.get('items') as string)
  const [id, version] = (data.get('id') as string).split('–')
  
  const order = await square.ordersApi.updateOrder(id, {
    fieldsToClear: ['line_items'],
    order: {
      version: Number(version),
      locationId: 'LMZ1D77E3HVRH',
      lineItems: items.map(item => (
        {
          quantity: item.quantity.toString(),
          catalogObjectId: item.id
        }
      ))
    }
  })
  
  revalidateTag('account')

  return {
    order
  }
}


export const signup = async (data: FormData) => {
  const customerId = '7D44X9294QETTXM2ZD9D25S0FR'
  const password = hashPassword(data.get('password') as string)
  const response = await square.customerCustomAttributesApi.bulkUpsertCustomerCustomAttributes({
    values: {
      'pw': {
        customerId,
        customAttribute: {
          key: 'pw',
          value: password.password
        }
      },
      'salt': {
        customerId,
        customAttribute: {
          key: 'salt',
          value: password.salt
        }
      }
    }
  })
  // log(response.result)
  cookies().set('customer', customerId, { httpOnly: true, path: '/' })
  // redirect(link.result.paymentLink.longUrl)
  return {
    // response
  }
}


export const login = async (data: FormData) => {
  const customer = await square.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: {
          exact: 'phil@phils.computer'
        }
      }
    }
  })
  // log(customer.result)

  if (!customer.result.customers.length) {
    throw Error('no customer')
  }

  const attributes = await square.customerCustomAttributesApi.listCustomerCustomAttributes(customer.result.customers[0].id)
  // log(attributes.result)

  const customerPassword = hashPassword(data.get('password') as string, attributes.result.customAttributes.find(attribute => attribute.key === 'salt').value as string)

  // log([customerPassword.password, attributes.result.customAttributes.find(attribute => attribute.key === 'pw').value as string])
  cookies().set('customer', customer.result.customers[0].id, { httpOnly: true, path: '/' })
  // redirect(link.result.paymentLink.longUrl)
  // return {
  //   link
  // }
}

export const logout = async (data: FormData) => {
 
  cookies().delete('customer')
  // redirect(link.result.paymentLink.longUrl)
  // return {
  //   link
  // }
}

export const customer = async () => {
  const customer = cookies().has('customer')
    ? await square.customersApi.retrieveCustomer(cookies().get('customer').value)
    : undefined

  return customer
}