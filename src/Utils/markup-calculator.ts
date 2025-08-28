export function calculateMarkup({exchangeRate, margin}: {exchangeRate: number, margin: number}) {
    const retailRate = (1-margin) * exchangeRate;
    return retailRate;
}