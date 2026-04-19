export const PAYMENT_CUSTOMIZATION_CREATE = `
    mutation paymentCustomise($input: PaymentCustomizationInput!) {
      paymentCustomizationCreate(paymentCustomization: $input) {
        paymentCustomization {
          id
        }
        userErrors {
          message
        }
      }
    }`