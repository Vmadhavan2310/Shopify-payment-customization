import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { authenticate } from "~/shopify.server";
import { MARKETS } from '../graphql/markets';
import { PAYMENT_CUSTOMIZATION_CREATE } from '../graphql/PaymentCreate';
import db from '../db.server';

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const response = await admin.graphql(MARKETS);
  const markets = await response.json();
  const dbData = await db.paymentCustomization.findFirst({
    where: {
      shop: session.shop,
    },
  })

console.log(dbData, 'dbdata')  
return {
    data: markets.data.markets.nodes,
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const resp = await admin.graphql(
    PAYMENT_CUSTOMIZATION_CREATE,
    {
      variables: {
        input: {
          functionHandle: "payment-customization",
          title: "COD Payment",
          enabled: true,
          metafields: [
            {
              namespace: "$app:payment-customization",
              key: "payment-configuration",
              type: "json",
              value: JSON.stringify({
                isoCodes: formData.get('selectedIso'),
                paymentList: formData.get('payment-list')
              }),
            },
          ],
        },
      },
    },
  );
  const data = await resp.json();
   if (data?.data?.paymentCustomizationCreate?.paymentCustomization?.id) {
    await db.paymentCustomization.create({
      data: {
        shopifyId: data.data.paymentCustomizationCreate.paymentCustomization.id,
        shop: session.shop,
        isoCodes: formData.get('selectedIso'),
        paymentMethod: formData.get('payment-list'),
      },
    });
  }
  return {
    data
  }
};

export default function Index() {
  const fetcher = useFetcher();
  const loader = useLoaderData();
  const shopify = useAppBridge();
  const [selectedCoutries, setSelectedCountry] = useState([]);

  const marketPicker = async () => {
    const items = loader.data.map((item) => {
      return {
        id: item.id,
        heading: item.name,
        data: [item.currencySettings?.baseCurrency?.currencyCode ?? ''],
        badges: [{content: item.status[0] + item.status.slice(1).toLowerCase(), tone: `${item.status === 'ACTIVE' ? 'success' : 'critical'}`}],
        selected: false
      };
    });
    const selected = await shopify.picker({
      heading: "Select the Country for COD",
      multiple: true,
      headers: [
        { content: "Country" },
        { content: "Currency" }
      ],
      items,
    });

    const isoCodes = loader.data.filter(country => selected.selected.includes(country.id)).map(country => country?.regions?.nodes[0]?.code ?? '');
    if(isoCodes.length) setSelectedCountry(isoCodes);
  };

  return (
    <>
      <s-page heading="Payment Customization">
        <s-button variant="primary" slot="primary-action">
          Contact Us
        </s-button>
        
        <s-section>
          <s-stack padding="large large-500">
            <fetcher.Form
              method="POST"
            >
              <input type="hidden" value={selectedCoutries} name="selectedIso"></input>
              <s-stack direction="block" gap="large-500">
                <s-grid gridTemplateColumns="repeat(2,1fr)" gap="base">
                  <s-grid-item>
                    <s-select
                      label="Payment Countries"
                      required
                      name="country"
                      placeholder="Select Country"
                      onClick={marketPicker}
                    >
                      {loader.data.length > 100 &&
                        loader.data.map((country) => {
                          const currency = country.currencySettings?.baseCurrency;
                          return (
                            <s-option
                              id={country.id}
                              value={
                                currency
                                  ?.currencyCode ?? null
                              }
                            >
                              {`${country.name} ${currency ?  ' - ' + currency?.currencyCode : ''}`}
                            </s-option>
                          );
                        })}
                    </s-select>
                  </s-grid-item>

                  <s-grid-item>
                    <s-text-field
                      label="Payment Options"
                      value="Cash on Delivery (COD)"
                      name="payment-list"
                      readOnly
                    ></s-text-field>
                  </s-grid-item>
                </s-grid>
                <s-stack direction="inline" gap="base" justifyContent="end">
                  <s-button>Discard</s-button>
                  <s-button variant="primary" type="submit">
                    Save
                  </s-button>
                </s-stack>
              </s-stack>
            </fetcher.Form>
          </s-stack>
        </s-section>
      </s-page>
    </>
  );
}
