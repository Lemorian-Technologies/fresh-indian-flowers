import { orders } from "@wix/ecom";
import { ApiKeyStrategy, createClient } from "@wix/sdk";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from 'next';

const myWixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY || '',
    siteId: process.env.SITE_ID || '',
    accountId: process.env.ACCOUNT_ID || '',
  }),
  modules: {
    orders,
  },
});

type ResponseData = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log("Request",req.query)

  const {start,end} = req.query;
  const formattedStartDate = moment(start).format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = moment(end).format('YYYY-MM-DDTHH:mm:ss');

  console.log("formattedStartDate",formattedStartDate)
  myWixClient.orders.searchOrders({
    search:{
      filter:{
        $and:[{createdDate:{$gte: formattedStartDate}}, {createdDate:{$lt: formattedEndDate}}]
      }
    },
  }).then(cat => {
    res.status(200).json({ message: JSON.stringify(cat) })
  }).catch(err => {
    console.log(err)
    res.status(500).json({ message: JSON.stringify(err) })
  })
}
