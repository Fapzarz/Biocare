import { ready, KeyPair, box, randomBytes } from 'libsodium-wrappers';

export class E2EEncryption {
  private keyPair: KeyPair | null = null;

  async init() {
    await ready;
    this.keyPair = box.keyPair();
  }

  getPublicKey(): string {
    if (!this.keyPair) throw new Error('Encryption not initialized');
    return Buffer.from(this.keyPair.publicKey).toString('base64');
  }

  async encrypt(message: string, recipientPublicKey: string): Promise<string> {
    if (!this.keyPair) throw new Error('Encryption not initialized');

    const nonce = randomBytes(box.nonceLength);
    const messageUint8 = new TextEncoder().encode(message);
    const recipientKeyUint8 = Buffer.from(recipientPublicKey, 'base64');

    const encryptedMessage = box.encrypt(
      messageUint8,
      nonce,
      recipientKeyUint8,
      this.keyPair.privateKey
    );

    return Buffer.from(encryptedMessage).toString('base64');
  }

  async decrypt(encryptedMessage: string, senderPublicKey: string): Promise<string> {
    if (!this.keyPair) throw new Error('Encryption not initialized');

    const messageUint8 = Buffer.from(encryptedMessage, 'base64');
    const senderKeyUint8 = Buffer.from(senderPublicKey, 'base64');

    const decryptedMessage = box.decrypt(
      messageUint8,
      senderKeyUint8,
      this.keyPair.privateKey
    );

    return new TextDecoder().decode(decryptedMessage);
  }
}

export const encryption = new E2EEncryption();