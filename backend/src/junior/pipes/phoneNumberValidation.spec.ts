import { PhoneNumberValidationPipe } from './phoneNumberValidation.pipe';
import { ResetPhoneNumberValidationPipe } from './resetPhoneNumberValidation.pipe';

describe('Phone number validation', () => {
  // Generate valid Finnish phone numbers
  // Local format: 0 + 9-13 digits
  // International: + + 9-13 digits (including country code)
  const validLocalNumbers = [
    '0401234567',      // 10 chars: 0 + 9 digits
    '04012345678',     // 11 chars: 0 + 10 digits
    '040123456789',    // 12 chars: 0 + 11 digits
    '0401234567890',   // 13 chars: 0 + 12 digits
    '04012345678901',  // 14 chars: 0 + 13 digits
  ];

  const validIntlNumbers = [
    '+358401234567',   // 14 chars: + + 12 digits (358 country + 9)
    '+35840123456',    // 13 chars: + + 11 digits
    '+3584012345',     // 12 chars: + + 10 digits
    '+358401234',      // 11 chars: + + 9 digits
  ];

  const validNumbers = [...validLocalNumbers, ...validIntlNumbers];

  describe('PhoneNumberValidationPipe', () => {
    const validationPipe = new PhoneNumberValidationPipe();

    it('passes valid phone numbers', () => {
      for (let phoneNumber of validNumbers) {
        const value = {
          phoneNumber,
          parentsPhoneNumber: phoneNumber,
        };
        expect(validationPipe.transform(value)).toBe(value);
        expect(validationPipe.transform({ userData: value })).toEqual({
          userData: value,
        });
      }
    });

    it('rejects invalid phone numbers', () => {
      // Incorrect length (too short)
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777',
          parentsPhoneNumber: '+358507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          userData: {
            phoneNumber: '050777',
            parentsPhoneNumber: '+358507777',
          },
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '+358507777',
          parentsPhoneNumber: '050777',
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          userData: {
            phoneNumber: '+358507777',
            parentsPhoneNumber: '050777',
          },
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');

      // Incorrect length (too long - over 13 digits after prefix)
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777777777777',  // 14 digits after 0
          parentsPhoneNumber: '+358507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '+358507777',
          parentsPhoneNumber: '050777777777777',  // 14 digits after 0
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');

      // Incorrect prefix
      expect(() =>
        validationPipe.transform({
          phoneNumber: '357507777777',  // doesn't start with 0 or +
          parentsPhoneNumber: '0507777777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '0507777777',
          parentsPhoneNumber: '359507777777',  // doesn't start with 0 or +
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');
    });
  });

  describe('ResetPhoneNumberValidationPipe', () => {
    const validationPipe = new ResetPhoneNumberValidationPipe();

    it('passes valid phone numbers', () => {
      for (let phoneNumber of validNumbers) {
        const value = { phoneNumber };
        expect(validationPipe.transform(value)).toBe(value);
      }
    });

    it('rejects invalid phone numbers', () => {
      // Incorrect length (too short)
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');

      // Incorrect length (too long - over 13 digits after prefix)
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777777777777',  // 14 digits after 0
        }),
      ).toThrow('Puhelinnumero on virheellinen');

      // Incorrect prefix (doesn't start with 0 or +)
      expect(() =>
        validationPipe.transform({
          phoneNumber: '357507777777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
    });
  });
});
