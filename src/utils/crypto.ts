import * as crypto from "node:crypto";

export class Crypto {
  static hash(input: any) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
  }
}
