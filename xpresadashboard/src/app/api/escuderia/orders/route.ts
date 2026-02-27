import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get('days');
  const startParam = searchParams.get('startDate');
  const endParam = searchParams.get('endDate');

  let formattedDateQuery = "";

  if (startParam) {
    // Si hay parámetros de fecha específicos (Día a día o rango exacto)
    formattedDateQuery = `created_at:>=${startParam}`;
    if (endParam) {
      formattedDateQuery += ` AND created_at:<=${endParam}`;
    }
  } else {
    // Lógica anterior por número de días (Relativo a ahora)
    const daysNum = parseInt(days || '1');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    formattedDateQuery = `created_at:>=${startDate.toISOString()}`;
  }

  const shopifyStore = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyStore || !accessToken) {
    return NextResponse.json({ error: 'Faltan credenciales de Shopify' }, { status: 500 });
  }

  try {
    // GraphQL query filtrado por pedidos PAGADOS
    const query = `
      {
        orders(first: 100, query: "financial_status:paid AND ${formattedDateQuery}", sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              customer {
                firstName
                lastName
                email
                phone
              }
              shippingAddress {
                address1
                address2
                city
                province
                zip
                phone
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    variantTitle
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${shopifyStore}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: 'Error en Shopify API', details: data.errors }, { status: 400 });
    }

    const orders = data.data.orders.edges.map(({ node }: any) => ({
      id: node.id,
      name: node.name.replace('#', ''),
      createdAt: node.createdAt,
      total: node.totalPriceSet.shopMoney.amount,
      customer: `${node.customer?.firstName || ''} ${node.customer?.lastName || ''}`.trim() || 'Cliente sin nombre',
      email: node.customer?.email,
      phone: node.customer?.phone || node.shippingAddress?.phone,
      address: node.shippingAddress,
      items: node.lineItems.edges.map(({ node: item }: any) => ({
        title: item.title,
        variant: item.variantTitle,
        image: item.image?.url,
        quantity: item.quantity,
        price: item.originalUnitPriceSet.shopMoney.amount,
        total: parseFloat(item.originalUnitPriceSet.shopMoney.amount) * item.quantity
      }))
    }));

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
