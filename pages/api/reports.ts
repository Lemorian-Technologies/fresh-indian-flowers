import { orders } from "@wix/ecom";
import { ApiKeyStrategy, createClient } from "@wix/sdk";
import moment from "moment-timezone";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { start, end } = req.query;

  const formattedStartDate = moment(start).format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = moment(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  try {
    const ordersData = await myWixClient.orders.searchOrders({
      search: {
        filter: {
          $and: [
            { createdDate: { $gte: formattedStartDate } },
            { createdDate: { $lte: formattedEndDate } }
          ]
        }
      },
    });

    // Filter out canceled orders
    const validOrders = ordersData.orders.filter(order => order.status !== 'CANCELED');

    // Convert valid orders to CSV
    const csv = convertToCSV(validOrders, formattedStartDate, formattedEndDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.status(200).send(csv); // Send CSV directly
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
}

// Helper function to convert orders to CSV format
function convertToCSV(data: any[], formattedStartDate: string, formattedEndDate: string) {
  if (data.length === 0) {
    return 'No data available\n';
  }

  const customerProductQuantities: { [key: string]: { [key: string]: number } } = {};
  const uniqueProducts = new Set<string>();

  // Aggregate data
  data.forEach(order => {
    const { billingInfo, lineItems } = order;
    const { address, contactDetails } = billingInfo || {};
    const { firstName, lastName, phone } = contactDetails || {};
    const customerKey = `${firstName}-${lastName}-${phone}`;

    lineItems.forEach((item: { productName: { original: string; }; quantity: number; }) => {
      const productName = item.productName?.original || 'Unknown Product';
      const productQuantity = item.quantity || 0;

      if (!customerProductQuantities[customerKey]) {
        customerProductQuantities[customerKey] = {};
      }

      customerProductQuantities[customerKey][productName] = (customerProductQuantities[customerKey][productName] || 0) + productQuantity;
      uniqueProducts.add(productName);
    });
  });

  const customersArray = Object.keys(customerProductQuantities).sort();
  const productsArray = Array.from(uniqueProducts).sort();

  // CSV header with date range
  let csvContent = `Orders from ${formattedStartDate} to ${formattedEndDate}\n`;
  csvContent += `Product,${customersArray.join(",")},Total\n`;

  // Construct CSV rows
  productsArray.forEach(product => {
    let row = product;
    let totalQuantity = 0;

    customersArray.forEach(customer => {
      const quantity = customerProductQuantities[customer]?.[product] || 0;
      row += `,${quantity}`;
      totalQuantity += quantity;
    });

    row += `,${totalQuantity}`;
    csvContent += row + "\n";
  });

  return csvContent;
}
