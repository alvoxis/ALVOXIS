
const PRODUCTS = {
  "ALVOXIS Mini Gift Box": 4999,
  "ALVOXIS Classic Gift Box": 5999,
  "ALVOXIS Powerbank Gift Box": 7599
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://alvoxis.github.io",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const data = JSON.parse(event.body || "{}");
    const items = data.items || [];
    const customer = data.customer || {};

    if (!items.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Cart is empty"
        })
      };
    }

    const lineItems = [];

    for (const item of items) {
      const price = PRODUCTS[item.product];

      if (!price) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Invalid product"
          })
        };
      }

      const quantity = Math.max(
        1,
        Math.min(Number(item.quantity) || 1, 10)
      );

      lineItems.push({
        price,
        name: item.product,
        quantity
      });
    }

    const params = new URLSearchParams();

    params.append("mode", "payment");

    params.append(
      "success_url",
      `${event.headers.origin || "https://alvoxis.github.io"}/?payment=success`
    );

    params.append(
      "cancel_url",
      `${event.headers.origin || "https://alvoxis.github.io"}/?payment=cancelled`
    );

    lineItems.forEach((item, index) => {
      params.append(
        `line_items[${index}][price_data][currency]`,
        "eur"
      );

      params.append(
        `line_items[${index}][price_data][unit_amount]`,
        String(item.price)
      );

      params.append(
        `line_items[${index}][price_data][product_data][name]`,
        item.name
      );

      params.append(
        `line_items[${index}][quantity]`,
        String(item.quantity)
      );
    });

    params.append(
      "customer_email",
      String(customer.email || "")
    );

    params.append(
      "metadata[customer_name]",
      String(customer.name || "").slice(0, 500)
    );

    params.append(
      "metadata[phone]",
      String(customer.phone || "").slice(0, 100)
    );

    params.append(
      "metadata[country]",
      String(customer.country || "").slice(0, 100)
    );

    params.append(
      "metadata[city]",
      String(customer.city || "").slice(0, 100)
    );

    params.append(
      "metadata[address]",
      String(customer.address || "").slice(0, 500)
    );

    params.append(
      "metadata[postal_code]",
      String(customer.postal || "").slice(0, 50)
    );

    params.append(
      "metadata[comment]",
      String(customer.comment || "").slice(0, 500)
    );

    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const session = await response.json();

    if (!response.ok || !session.url) {
      console.error("Stripe error:", session);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to create payment session"
        })
      };
    }

    return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    url: session.url
  })
};
      body: ""
    };

  } catch (error) {
    console.error("Checkout error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error"
      })
    };
  }
};
