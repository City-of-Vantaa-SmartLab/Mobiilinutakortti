import { argon2, randomBytes, timingSafeEqual, } from "node:crypto"

type Argon2Algorithm = Parameters<typeof argon2>[0]
type Argon2Params = Parameters<typeof argon2>[1]

// The PHC standard says not to pad the base64 strings by default, so strip padding.
function encodePhcBase64(value: Buffer): string {
    return value.toString("base64").replace(/=+$/u, "")
}

function parsePositiveInteger(value: string | undefined): number | null {
    if (!value) return null

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0) return null

    return parsed
}

function argon2AsyncWrapper(alg: Argon2Algorithm, params: Argon2Params): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        argon2(alg, params, (err, derivedKey) => {
            if (err) reject(err)
            else resolve(derivedKey)
        })
    })
}

// Produces a PHC string to store into a database.
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16)
    const hash = await argon2AsyncWrapper("argon2id", {
        message: password,
        nonce: salt,
        memory: 65536,
        passes: 3,
        parallelism: 4,
        tagLength: 32,
    })

    return [
        "$argon2id",
        "v=19",
        "m=65536,t=3,p=4",
        encodePhcBase64(salt),
        encodePhcBase64(Buffer.from(hash)),
    ].join("$")
}

// Compare given password to a PHC string from database.
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const parts = storedHash.split("$")

        if (parts.length !== 6) return false

        const [
            ,
            algorithm,
            version,
            parameterString,
            saltBase64,
            hashBase64,
        ] = parts

        if (algorithm !== "argon2id" || version !== "v=19") return false

        const params = Object.fromEntries(
            parameterString
                .split(",")
                .map(p => p.split("="))
        )

        const memory = parsePositiveInteger(params.m)
        const passes = parsePositiveInteger(params.t)
        const parallelism = parsePositiveInteger(params.p)

        if (!memory || !passes || !parallelism) return false

        const salt = Buffer.from(saltBase64, "base64")
        const expectedHash = Buffer.from(hashBase64, "base64")

        if (salt.length === 0 || expectedHash.length === 0) return false

        const calculatedHash = await argon2AsyncWrapper(
            "argon2id",
            {
                message: password,
                nonce: salt,
                memory,
                passes,
                parallelism,
                tagLength: expectedHash.length,
            }
        )

        return timingSafeEqual(
            expectedHash,
            Buffer.from(calculatedHash)
        )
    } catch {
        return false
    }
}
