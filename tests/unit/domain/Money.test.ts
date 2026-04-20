import { describe, it, expect } from 'vitest'
import { Money } from '../../../src/domain/order/value-objects/Money.js'

describe('Money', () => {
  describe('creation', () => {
    it('tạo Money hợp lệ', () => {
      const m = Money.of(100_000, 'VND')
      expect(m.amount).toBe(100_000)
      expect(m.currency).toBe('VND')
    })

    it('tự động uppercase currency', () => {
      const m = Money.of(50, 'vnd')
      expect(m.currency).toBe('VND')
    })

    it('round về 2 chữ số thập phân', () => {
      const m = Money.of(10.005, 'USD')
      expect(m.amount).toBe(10.01)
    })

    it('ném lỗi khi amount âm', () => {
      expect(() => Money.of(-1, 'VND')).toThrow('cannot be negative')
    })

    it('ném lỗi khi currency rỗng', () => {
      expect(() => Money.of(100, '')).toThrow('Currency cannot be empty')
    })
  })

  describe('arithmetic', () => {
    it('cộng hai Money cùng currency', () => {
      const a = Money.of(100_000, 'VND')
      const b = Money.of(50_000, 'VND')
      expect(a.add(b).amount).toBe(150_000)
    })

    it('ném lỗi khi cộng khác currency', () => {
      const vnd = Money.of(100, 'VND')
      const usd = Money.of(100, 'USD')
      expect(() => vnd.add(usd)).toThrow('Currency mismatch')
    })

    it('nhân với factor', () => {
      const m = Money.of(25_000, 'VND')
      expect(m.multiply(3).amount).toBe(75_000)
    })

    it('immutable — add trả về instance mới', () => {
      const original = Money.of(100, 'VND')
      const result = original.add(Money.of(50, 'VND'))
      expect(original.amount).toBe(100)
      expect(result.amount).toBe(150)
    })
  })

  describe('comparison', () => {
    it('equals khi cùng amount và currency', () => {
      expect(Money.of(100, 'VND').equals(Money.of(100, 'VND'))).toBe(true)
    })

    it('không equals khi khác amount', () => {
      expect(Money.of(100, 'VND').equals(Money.of(200, 'VND'))).toBe(false)
    })

    it('isGreaterThan', () => {
      expect(Money.of(200, 'VND').isGreaterThan(Money.of(100, 'VND'))).toBe(true)
    })
  })
})