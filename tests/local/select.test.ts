import { expect } from 'chai';
import { 
    bsv, 
    FixedArray, 
    PubKey, 
    PubKeyHash, 
    Ripemd160, 
    Sig,
    signTx, 
    toByteString, 
    toHex 
} from 'scrypt-ts';
import { Select } from '../../src/contracts/Select';
import { dummyUTXO, 
    newTx,
    inputIndex,
    inputSatoshis
 } from './util/txHelper'

describe('Test SmartContract `Select`', () => {

    before(async () => {
        await Select.compile(); // asm
    })

    it('should pass with valid hunter', async () => {
        // constructor arguments
        const tx = newTx();
        const privateKey = bsv.PrivateKey.fromRandom('testnet');
        const publicKey = bsv.PublicKey.fromPrivateKey(privateKey)
        const pubKey = PubKey(toHex(publicKey));
        const hunter1: Ripemd160 = Ripemd160(toByteString('01'));
        const hunter2: Ripemd160 = Ripemd160(toByteString('02'));
        const hunter3: Ripemd160 = Ripemd160(toByteString('03'));
        const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2,hunter3];
        // create a genesis instance
        let demo = new Select(pubKey, hunters)
        // unlockFrom
        demo.unlockFrom = { tx, inputIndex }
        // Valid SELECT 
        // console.log(demo.open);
        const result = demo.verify(() => {
            // const makerSig = signTx(
            //     tx,
            //     privateKey,
            //     demo.lockingScript,
            //     inputSatoshis
            // );
            // self.select(Sig(toHex(makerSig)), hunter2);
            console.log(demo.open);
            demo.select();
        })  
        expect(result.success).to.be.true;
    })

    // it('should fail with invalid hunter', () => {
    //     // expect(result.success).to.be.true
    //     const utxos = [dummyUTXO]
    //     // constructor arguments
    //     const tx = newTx();
    //     const privateKeyMaker = bsv.PrivateKey.fromRandom('testnet');
    //     const publicKeyMaker = bsv.PublicKey.fromPrivateKey(privateKeyMaker)
    //     const pubKeyMaker = PubKey(toHex(publicKeyMaker));
    //     const hunter1: Ripemd160 = Ripemd160(toByteString('01'));
    //     const hunter2: Ripemd160 = Ripemd160(toByteString('02'));
    //     const hunter3: Ripemd160 = Ripemd160(toByteString('03'));
    //     const hunter4: Ripemd160 = Ripemd160(toByteString('04'));
    //     const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2,hunter3];
    //     // create a genesis instance
    //     let select = new Select(pubKeyMaker, hunters).markAsGenesis();
    //     // construct a transaction for deployment
    //     let deployTx = select.getDeployTx(utxos, 1);
    //     // Invalid SELECT
    //     // 1. build a new contract instance
    //     select = select.next();
    //     // 2. apply the updates on the new instance.
    //     select.winner = hunter2;
    //     select.open = false;
    //     // 3. run `verify` method on `prevInstance`
    //     const result1 = select.verify((self) => {
    //         const makerSig = signTx(
    //             tx,
    //             privateKeyMaker,
    //             self.lockingScript,
    //             inputSatoshis
    //         );
    //         self.select(Sig(toHex(makerSig)), hunter4);
    //      })
    // })

    // it('should fail with invalid signature', () => {
    //     // expect(result.success).to.be.true
    //     const utxos = [dummyUTXO]
    //     // constructor arguments
    //     const privateKeyMaker = bsv.PrivateKey.fromRandom('testnet');
    //     const publicKeyMaker = bsv.PublicKey.fromPrivateKey(privateKeyMaker)
    //     const pubKeyMaker = PubKey(toHex(publicKeyMaker));
    //     const invalidSig = ;
    //     const hunter1: Ripemd160 = Ripemd160(toByteString('01'));
    //     const hunter2: Ripemd160 = Ripemd160(toByteString('02'));
    //     const hunter3: Ripemd160 = Ripemd160(toByteString('03'));
    //     // create a genesis instance
    //     const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2,hunter3];
    //     let prevInstance = new Select(pubKeyMaker, hunters).markAsGenesis();
    //     // construct a transaction for deployment
    //     let prevTx = prevInstance.getDeployTx(utxos, 1);

    //     // Invalid SELECT
    //     const newSelect = prevInstance.next();
    //     const invalidTx = prevInstance.getSelectTx(utxos, prevTx, newSelect, invalidSig, hunter2);
    //     expect(() => {
    //         newSelect.select(invalidSig, hunter2);
    //     }).to.throw(/Execution failed/)
        
    // })

    // it('should fail with two selects', () => {
    //     // expect(result.success).to.be.true
    //     const utxos = [dummyUTXO]
    //     // constructor arguments
    //     const privateKeyMaker = bsv.PrivateKey.fromRandom('testnet');
    //     const publicKeyMaker = bsv.PublicKey.fromPrivateKey(privateKeyMaker)
    //     const pubKeyMaker = PubKey(toHex(publicKeyMaker));
    //     const makerSig = ;
    //     const hunter1: Ripemd160 = Ripemd160(toByteString('01'));
    //     const hunter2: Ripemd160 = Ripemd160(toByteString('02'));
    //     const hunter3: Ripemd160 = Ripemd160(toByteString('03'));
    //     // create a genesis instance
    //     const hunters: FixedArray<PubKeyHash, 3> = [hunter1, hunter2,hunter3];
    //     let prevInstance = new Select(pubKeyMaker, hunters).markAsGenesis();
    //     // construct a transaction for deployment
    //     let prevTx = prevInstance.getDeployTx(utxos, 1);

    //     // Valid SELECT
    //     // 1. build a new contract instance
    //     const newSelect = prevInstance.next();
    //     // 2. apply the updates on the new instance.
    //     newSelect.winner = hunter2;
    //     newSelect.open = false;
    //     // 3. construct a transaction for contract call
    //     const selectTx = prevInstance.getSelectTx(utxos, prevTx, newSelect, makerSig, hunter2);
    //     // 4. run `verify` method on `prevInstance`
    //     const result1 = prevInstance.verify((self) => {
    //         self.select(makerSig, hunter2);
    //     })

    //     // prepare for the next iteration
    //     prevTx = selectTx;
    //     prevInstance = newSelect;

    //     // Invalid SELECT
    //     const newSelect1 = prevInstance.next();
    //     const selectTx1 = prevInstance.getSelectTx(utxos, prevTx, newSelect, makerSig, hunter1);
    //     expect(() => {
    //         newSelect.select(makerSig, hunter1);
    //     }).to.throw(/Execution failed/)
    // })
})