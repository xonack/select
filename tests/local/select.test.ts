import { expect } from 'chai'
import {
    bsv,
    FixedArray,
    PubKey,
    PubKeyHash,
    Ripemd160,
    Sig,
    signTx,
    toByteString,
    toHex,
} from 'scrypt-ts'
import { Select } from '../../src/contracts/Select'
import { dummyUTXO, newTx, inputSatoshis } from './util/txHelper'

describe('Test SmartContract `Select`', () => {
    before(async () => {
        await Select.compile()
    })

    it('should pass with valid', async () => {
        // constructor arguments
        const inputIndex = 1
        const utxos = [dummyUTXO]
        const privateKey = bsv.PrivateKey.fromRandom('testnet')
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey))
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
        // create a genesis instance
        const demo = new Select(pubKey, hunters).markAsGenesis()
        // construct a transaction for deployment
        const deployTx = demo.getDeployTx(utxos, 1)
        const newSelect = demo.next()
        newSelect.winner = hunter2
        newSelect.open = false
        const selectTx = demo.getSelectTx(
            utxos,
            deployTx,
            newSelect,
            privateKey,
            hunter2
        )
        const result = demo.verify((self) => {
            self.select(
                Sig(selectTx.getSignature(inputIndex) as string),
                hunter2
            )
        })
        expect(result.success, result.error).to.be.true

        const newSelect2 = newSelect.next()
        expect(() => {
            newSelect.getSelectTx(
                utxos,
                selectTx,
                newSelect2,
                privateKey,
                hunter2
            )
        }).to.throw(/Execution failed, can`t select winner for closed bounty/)
    })

    it('fail valid then valid (2 selects)', async () => {
        // constructor arguments
        const inputIndex = 1
        const utxos = [dummyUTXO]
        const privateKey = bsv.PrivateKey.fromRandom('testnet')
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey))
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
        // create a genesis instance
        const demo = new Select(pubKey, hunters).markAsGenesis()
        // construct a transaction for deployment
        const deployTx = demo.getDeployTx(utxos, 1)
        const newSelect = demo.next()
        newSelect.winner = hunter2
        newSelect.open = false
        const selectTx = demo.getSelectTx(
            utxos,
            deployTx,
            newSelect,
            privateKey,
            hunter2
        )
        const result = demo.verify((self) => {
            self.select(
                Sig(selectTx.getSignature(inputIndex) as string),
                hunter2
            )
        })
        expect(result.success, result.error).to.be.true

        const newSelect2 = newSelect.next()
        expect(() => {
            newSelect.getSelectTx(
                utxos,
                selectTx,
                newSelect2,
                privateKey,
                hunter2
            )
        }).to.throw(/Execution failed, can`t select winner for closed bounty/)
    })

    it('should fail with invalid hunter', async () => {
        // constructor arguments
        const inputIndex = 1
        const utxos = [dummyUTXO]
        const privateKey = bsv.PrivateKey.fromRandom('testnet')
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey))
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
        const hunter4: Ripemd160 = Ripemd160(toByteString('04'))
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
        // create a genesis instance
        const demo = new Select(pubKey, hunters).markAsGenesis()
        // construct a transaction for deployment
        const deployTx = demo.getDeployTx(utxos, 1)
        const newSelect = demo.next()
        // newSelect.winner = hunter2
        // newSelect.open = false
        const selectTx = demo.getSelectTx(
            utxos,
            deployTx,
            newSelect,
            privateKey,
            hunter2
        )
        expect(() => {
            demo.select(
                Sig(selectTx.getSignature(inputIndex) as string),
                hunter4
            )
        }).to.throw(/Execution failed/)
    })

    it('should fail with invalid signature', async () => {
        // constructor arguments
        const inputIndex = 1
        const utxos = [dummyUTXO]
        const privateKey = bsv.PrivateKey.fromRandom('testnet')
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey))
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
        const hunter4: Ripemd160 = Ripemd160(toByteString('04'))
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
        // create a genesis instance
        const demo = new Select(pubKey, hunters).markAsGenesis()
        // construct a transaction for deployment
        const deployTx = demo.getDeployTx(utxos, 1)
        const newSelect = demo.next()
        // newSelect.winner = hunter2
        // newSelect.open = false
        const selectTx = demo.getSelectTx(
            utxos,
            deployTx,
            newSelect,
            privateKey,
            hunter2
        )
        expect(() => {
            demo.select(Sig('55'), hunter4)
        }).to.throw(/Execution failed/)
    })
})
