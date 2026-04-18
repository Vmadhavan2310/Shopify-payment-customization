// @ts-check

/**
 * @typedef {import("../generated/api").CartPaymentMethodsTransformRunInput} CartPaymentMethodsTransformRunInput
 * @typedef {import("../generated/api").CartPaymentMethodsTransformRunResult} CartPaymentMethodsTransformRunResult
 */

/**
 * @type {CartPaymentMethodsTransformRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {CartPaymentMethodsTransformRunInput} input
 * @returns {CartPaymentMethodsTransformRunResult}
 */
export function cartPaymentMethodsTransformRun(input) {
  const configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}",
  );
  const isoCodes = configuration.isoCodes?.split(",") ?? [];
  if (!isoCodes.includes(input.localization.country.isoCode)) {
    const paymentId = input.paymentMethods.find((method) =>
      method.name
        .toLowerCase()
        .includes(configuration.paymentList.toLowerCase()),
    )?.id;

    if (paymentId) {
      return {
        operations: [
          {
            paymentMethodHide: {
              paymentMethodId: paymentId,
            },
          },
        ],
      };
    }
  }

  return NO_CHANGES;
}
