import express from "express";
import { Blockchain } from "./blockchain";

const PORT = process.env.PORT || 3000;

const app = express();

const blockchain = new Blockchain();

app.get("/mine_block", (_, res) => {
  const previous = blockchain.getPreviousBlock();
  const proof = blockchain.proofOfWork(previous.proof);
  const prevHash = blockchain.hash(previous);
  const block = blockchain.createBlock(proof, prevHash);

  res.json(block);
});

app.get("/get_chain", (_, res) => {
  res.json(blockchain.chain);
});

app.listen(PORT, () => {
  console.log("server on", PORT);
});
