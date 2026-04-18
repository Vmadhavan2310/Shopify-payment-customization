import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `query {
      markets(first: 100) {
        nodes {
          id
          name
          status
           currencySettings {
            baseCurrency {
              currencyCode
              enabled
            }
          }
        }
      }
    }
    `,
  );

  const markets = await response.json();
  return {
    data: markets.data.markets.nodes,
  };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  console.log(formData.get("country"), formData.get("payment-list"));
};

export default function Index() {
  const fetcher = useFetcher();
  const loader = useLoaderData();
  const shopify = useAppBridge();

  console.log(loader);

  const marketPicker = async () => {
    const items = loader.data.map((item) => {
      return {
        id: item.id,
        heading: item.name,
        data: [item.currencySettings.baseCurrency.currencyCode],
        badges: [{content: item.status[0] + item.status.slice(1).toLowerCase(), tone: `${item.status === 'ACTIVE' ? 'success' : 'critical'}`}]
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
    console.log(selected)
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
              onSubmit={() => fetcher.submit({}, { method: "GET" })}
            >
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
                      value="Cash On Delivery (COD)"
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
