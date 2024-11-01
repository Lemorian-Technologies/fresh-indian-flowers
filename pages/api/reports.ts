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
    
    const orderIds =ordersData.orders.map(order=>order.number);
    // console.log("orderIds",orderIds)
    const ordersData1 = await myWixClient.orders.searchOrders({
      search: {
        filter: {
          number: {$in:[10300]}
        }
      },
    });
    // let orderIds= Array(ordersData.orders.length);
    // for(let i=0;i<=ordersData.orders.length;i++)
    //   orderIds[i]=ordersData.orders[i]?.number

    console.log("ordersData.orders", ordersData1.orders)
    if (!ordersData || !ordersData.orders) {
      throw new Error("No orders found for the specified date range.");
    }

    const validOrders = ordersData.orders.filter(order => order.status !== 'CANCELED');
    const csv = convertToCSV(validOrders, formattedStartDate, formattedEndDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
}
// Helper function to convert orders to CSV format
function convertToCSV(data: any[], formattedStartDate: string, formattedEndDate: string) {
  if (data.length === 0) {
    return 'No data available\n';
  }

  const customerProductQuantities: { [key: string]: { [key: string]: number } } = {};
  const pickupCityQuantities: { [key: string]: { [key: string]: number } } = {};
  const uniqueProducts = new Set<string>();
  const orderNumbers = new Set<string>();

  // Aggregate data
  data.forEach(order => {
    const { billingInfo, lineItems, number, shippingInfo } = order;
    const { contactDetails } = billingInfo || {};
    const { firstName, lastName, phone } = contactDetails || {};

    // Collect pickup city
    const pickupCity = shippingInfo?.logistics?.pickupDetails?.address?.city || 'Unknown City';

    // Create a unique customer key
    const customerKey = `${number}-${firstName} ${lastName}-${phone}`;
    orderNumbers.add(number);

    // Aggregate product quantities for customer
    lineItems.forEach((item: { productName: { original: string; }; quantity: number; }) => {
      const productName = item.productName?.original || 'Unknown Product';
      const productQuantity = item.quantity || 0;

      // Update customer product quantities
      if (!customerProductQuantities[customerKey]) {
        customerProductQuantities[customerKey] = {};
      }
      customerProductQuantities[customerKey][productName] = (customerProductQuantities[customerKey][productName] || 0) + productQuantity;
      uniqueProducts.add(productName);

      // Update pickup city quantities
      if (!pickupCityQuantities[pickupCity]) {
        pickupCityQuantities[pickupCity] = {};
      }
      pickupCityQuantities[pickupCity][productName] = (pickupCityQuantities[pickupCity][productName] || 0) + productQuantity;
    });
  });

  const customersArray = Object.keys(customerProductQuantities).sort();
  const productsArray = Array.from(uniqueProducts).sort();
  const pickupCitiesArray = Object.keys(pickupCityQuantities).sort();

  // CSV header with date range
  let csvContent = `Orders from ${formattedStartDate} to ${formattedEndDate}\n`;
  csvContent += `Product,${customersArray.join(",")},Total\n`;

  // Construct CSV rows for customer product quantities
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

  // Add a separator for the pickup city table
  csvContent += `\nPickup City Summary\nProduct,${pickupCitiesArray.join(",")},Total\n`;

  // Construct CSV rows for pickup city quantities
  productsArray.forEach(product => {
    let row = product;
    let totalQuantity = 0;

    pickupCitiesArray.forEach(city => {
      const quantity = pickupCityQuantities[city]?.[product] || 0;
      row += `,${quantity}`;
      totalQuantity += quantity;
    });

    row += `,${totalQuantity}`;
    csvContent += row + "\n";
  });

  return csvContent;
}
