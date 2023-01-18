import { expect } from 'chai'
import {
    bsv,
    FixedArray,
    PubKey,
    PubKeyHash,
    Ripemd160,
    toByteString,
    toHex,
} from 'scrypt-ts'
import { Select } from '../../src/contracts/Select'
import { newTx, inputIndex } from './util/txHelper'

describe('Test SmartContract `Select`', () => {
    before(async () => {
        await Select.compile() // asm
    })

    it('should pass with valid hunter', async () => {
        // constructor arguments
        const tx = newTx()
        const privateKey = bsv.PrivateKey.fromRandom('testnet')
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey))
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
        // create a genesis instance
        const demo = new Select(pubKey, hunters)
        // unlockFrom
        demo.unlockFrom = { tx, inputIndex }
        const result = demo.verify(() => {
            console.log(demo.open)
            demo.select()
        })
        expect(result.success).to.be.true
    })
})
