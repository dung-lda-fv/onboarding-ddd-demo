export class Money {
    private constructor(private readonly _amount: number, private readonly _currency: string) {
        if (_amount < 0) {
            throw new Error(`Amount cannot be negative ${_amount}`)
        }

        if (!_currency || _currency.trim().length === 0) {
          throw new Error('Currency cannot be empty')
        }
    }

    // Factory method to create Money instances with proper validation and rounding, don't allow direct constructor access 
    // Ex: Money.of(10.123, 'USD') will create a Money instance with amount 10.12 USD, cannot new Money(10.123, 'USD') directly
    static of(amount: number, currency: string): Money {
        const rounded = Math.round(amount * 100) / 100
        return new Money(rounded, currency.toUpperCase())
    }

    static zero(currency: string): Money {
        return new Money(0, currency)
    }

    get amount(): number { return this._amount }
    get currency(): string { return this._currency }

    add(other: Money): Money {
        this.assertSameCurrency(other)
        return Money.of(this._amount + other._amount, this._currency)
    }

    multiply(factor: number): Money {
        if (factor < 0) throw new Error('Factor cannot be negative')
        return Money.of(this._amount * factor, this._currency)
    }

    isGreaterThan(other: Money): boolean {
        this.assertSameCurrency(other)
        return this._amount > other._amount
    }

    equals(other: Money): boolean {
        return this._amount === other._amount && this._currency === other._currency
    }

    toString(): string {
        return `${this._amount} ${this._currency}`
    }

    private assertSameCurrency(other: Money): void {
        if (this._currency !== other._currency) {
        throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`)
        }
    }
}