// export const fetchCache = 'only-no-store'

import { log, stringify } from '@/app/helpers'
import { square } from '@/clients/square'
import Link from 'next/link'
import { FunctionComponent } from 'react'
import { Customer, Phase as SqPhase, Subscription as SqSubscription } from 'square'
import { Cart, Wrap } from './Cart'
import { update } from '@/app/actions'
import { unstable_cache } from 'next/cache'

export const Subscriptions: FunctionComponent<{
  me: Customer
}> = async ({ me }) => {
  
  const subscriptions = await square.subscriptionsApi.searchSubscriptions({
    query: {
      filter: {
        customerIds: [
          me.id
        ],
        locationIds: [
          'LMZ1D77E3HVRH'
        ]
      }
    }
  })
  
  return <ul>
    {subscriptions.result?.subscriptions.map(subscription => <li key={subscription.id}>
      {subscription.invoiceIds}
      {/* {stringify(subscription)} */}
      <Subscription subscription={subscription} />
    </li>)}
  </ul>
}

export const Subscription: FunctionComponent<{
  subscription: SqSubscription
}> = async ({ subscription }) => {
  
  // const order = await square.ordersApi.retrieveOrder(phase.orderTemplateId)
  
  return <>
    {subscription.phases.map(phase => <Phase key={phase.uid} phase={phase} />)}
  </>
}


export const Phase: FunctionComponent<{
  phase: SqPhase
}> = async ({ phase }) => {
  const order = await unstable_cache(async () => square.ordersApi.retrieveOrder(phase.orderTemplateId), ['phase', phase.uid], {
    tags: ['account']
  })()
  log(order)
  
  return <Wrap key={`${order.result.order.id}–${order.result.order.version}`} id={`${order.result.order.id}–${order.result.order.version}`} defaultItems={order.result.order.lineItems.map(item => ({
    quantity: parseFloat(item.quantity),
    id: item.catalogObjectId,
    name: item.name,
    price: Number(item.variationTotalPriceMoney.amount)
  }))}>
    <h4>{[order.result.order.id, order.result.order.version].join(' – ')}</h4>
    <ul>
      {order.result.order.lineItems.map(item => <li key={item.uid}>
        {[item.name, item.quantity].join(' – ')}
      </li>)}
    </ul>
    <Cart action={update} label='Update' />
  </Wrap>
}