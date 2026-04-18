import { authenticate } from "../../app/shopify.server"
import { useFetcher } from "react-router";


export const loader = async ({request}) => {
  const {admin} = await authenticate.admin(request);
  const resp = await admin.graphql(
    `#graphql
mutation productUp($input: ProductInput! ) {
    productUpdate (input: $input) {
    product {
      title
      status
    }
  }
}          `,{
    variables: {
          "input": {
    "id": "gid://shopify/Product/7520658063457",
    "status": "DRAFT"
  }
    }
}  );
  const respjson = await resp.json();
  return respjson;
}

export const action = async ({request}) => {
  const {admin} = await authenticate.admin(request);
  const resp = await admin.graphql(
    `#graphql
query {
  products (first: 7) {
    nodes {
      title
    }
  }
}
    `
  );
  const formData = await request.formData();
  console.log(Object.fromEntries(formData))
  const respjson = await resp.json();
  return {
    product: respjson,  
  }
}
export default function FeaturedPage() {
    const fetcher = useFetcher();
    console.log('feature', fetcher)
    return (
        <s-text>Hewllo</s-text>
    )
}