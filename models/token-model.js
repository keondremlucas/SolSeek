// models/token-model.js
export class TokenModel {
    constructor(data) {
        this.signature = data.signature;
        this.mint = data.mint;
        this.traderPublicKey = data.traderPublicKey;
        this.txType = data.txType;
        this.initialBuy = data.initialBuy;
        this.solAmount = data.solAmount;
        this.bondingCurveKey = data.bondingCurveKey;
        this.vTokensInBondingCurve = data.vTokensInBondingCurve;
        this.vSolInBondingCurve = data.vSolInBondingCurve;
        this.marketCapSol = data.marketCapSol;
        this.name = data.name;
        this.symbol = data.symbol;
        this.uri = data.uri;
        this.pool = data.pool;
        this.createdAt = new Date();
    }

    getFormattedMarketCap() {
        return `${this.marketCapSol.toFixed(2)} SOL`;
    }

    getFormattedLiquidity() {
        return `${this.vSolInBondingCurve.toFixed(2)} SOL`;
    }

    getShortMint() {
        return `${this.mint.slice(0, 4)}...${this.mint.slice(-4)}`;
    }
}
