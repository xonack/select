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

    it('should pass with valid hunter', async () => {
        // constructor arguments
        const tx = newTx()
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
        // unlockFrom
        // demo.unlockFrom = { tx, inputIndex }
        const makerSig = signTx(tx, privateKey, demo.lockingScript, inputSatoshis)
        const newSelect = demo.next()
        newSelect.winner = hunter2
        newSelect.open = false
        const selectTx = demo.getSelectTx(
            utxos,
            deployTx,
            newSelect,
            Sig(toHex(makerSig)),
            hunter2
        )
        const result = demo.verify((self) => {
            self.select(Sig(toHex(makerSig)), hunter2)
        })
        expect(result.success, result.error).to.be.true
    })

    // // fails when accessing stateful variables - probably does not properly handle preimage
    // it('should pass with valid hunter', async () => {
    //     const inputIndex = 0;
    //     const tx = newTx()
    //     // constructor arguments
    //     const privateKey = bsv.PrivateKey.fromRandom('testnet')
    //     const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
    //     const pubKey = PubKey(toHex(publicKey))
    //     const hunter1: Ripemd160 = Ripemd160(toByteString('01'))
    //     const hunter2: Ripemd160 = Ripemd160(toByteString('02'))
    //     const hunter3: Ripemd160 = Ripemd160(toByteString('03'))
    //     const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2, hunter3]
    //     // create a genesis instance
    //     const demo = new Select(pubKey, hunters)
    //     // unlockFrom
    //     demo.unlockFrom = { tx, inputIndex }
    //     const result = demo.verify(() => {
    //         const makerSig = signTx(
    //             tx,
    //             privateKey,
    //             demo.lockingScript,
    //             inputSatoshis
    //         );
    //         demo.select(Sig(toHex(makerSig)), hunter2);
    //         // demo.select();
    //     })
    //     expect(result.success, result.error).to.be.true
    // })
})
