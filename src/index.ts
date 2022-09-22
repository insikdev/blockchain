import express from "express";
import { Blockchain } from "./blockchain";

const PORT = 3000;

const app = express();

const blockchain = new Blockchain();

app.get("/mine_block", (req, res) => {
  const previous = blockchain.getPreviousBlock();
  const proof = blockchain.proofOfWork(previous.proof);
  const prevHash = blockchain.hash(previous);
  blockchain.createBlock(proof, prevHash);

  console.log(blockchain.chain);
  console.log("isValid : ", blockchain.isChainValid());

  res.end("mine");
});

app.listen(PORT, () => {
  console.log("server on");
});
