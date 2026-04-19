export const MARKETS = `
query {
    markets(first: 100) {
    nodes {
        id
        name
        status
        regions(first: 50) {
            nodes {
                ... on MarketRegionCountry {
                code  
                name
                }
            }
        }
        currencySettings {
            baseCurrency {
                currencyCode
                enabled
            }
        }
    }
    }
}`