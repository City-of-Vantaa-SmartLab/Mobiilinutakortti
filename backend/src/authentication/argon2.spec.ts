import { comparePassword, hashPassword } from './argon2'

describe('argon2 helpers', () => {
    it('verifies hashes created by hashPassword', async () => {
        const password = 'Correct Horse Battery Staple'
        const hash = await hashPassword(password)
        const parts = hash.split('$')

        expect(parts).toHaveLength(6)
        expect(parts[4]).not.toContain('=')
        expect(parts[5]).not.toContain('=')
        await expect(comparePassword(password, hash)).resolves.toBe(true)
        await expect(comparePassword('wrong password', hash)).resolves.toBe(false)
    })

    it('accepts previously stored padded base64 hashes', async () => {
        const password = 'Correct Horse Battery Staple'
        const hash = await hashPassword(password)
        const [prefix, algorithm, version, parameters, salt, digest] = hash.split('$')
        const paddedHash = [
            prefix,
            algorithm,
            version,
            parameters,
            `${salt}==`,
            `${digest}=`,
        ].join('$')

        await expect(comparePassword(password, paddedHash)).resolves.toBe(true)
    })

    it('returns false for malformed stored hashes', async () => {
        await expect(comparePassword('password', '$argon2id$v=19$m=wat,t=3,p=4$bad$hash')).resolves.toBe(false)
        await expect(comparePassword('password', '$argon2i$v=19$m=65536,t=3,p=4$bad$hash')).resolves.toBe(false)
    })
})