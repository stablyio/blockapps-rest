import * as RestStatus from "http-status-codes";
import BigNumber from "bignumber.js";
import * as dotenv from "dotenv";
import rest from "../rest";
import assert from "../util/assert";
import util from "../util/util";
import fsUtil from "../util/fsUtil";
import factory from "./factory";
import { Options, Contract, TransactionResultHash, OAuthUser } from "../types";
import oauthUtil from "../util/oauth.util";
import { AccessToken } from "../util/oauth.util";

if (!process.env.USER_TOKEN) {
  const loadEnv = dotenv.config();
  assert.isUndefined(loadEnv.error);
}


const config = factory.getTestConfig();

const fixtures = factory.getTestFixtures();

describe("callStably", function() {
    this.timeout(config.timeout);
    let admin;
    const options:Options = { config };
  
    before(async () => {
      const oauth:oauthUtil = await oauthUtil.init(config.nodes[0].oauth);
      let accessToken:AccessToken = await oauth.getAccessTokenByClientSecret();
      const userArgs = { token: accessToken.token.access_token };
      admin = await factory.createAdmin(userArgs, options);
    });
  
    async function createContract(uid, admin, constructorArgs, options:Options) {
      const filename = `${fixtures}/all_StablyFiatToken_dependencies_safemath_inherited.sol`;
      const contractArgs = await factory.createContractFromFile(
        filename,
        uid,
        constructorArgs
      );
      const contract = await rest.createContract(admin, contractArgs, options);
      return contract;
    }

    // David: e2f9682bf68c8c7b92822f9fac136b5ddf285061
    // Hung: b0b40310f8c8e2fac65d867330c76225553caa4f
    const hungAddress = "b0b40310f8c8e2fac65d867330c76225553caa4f";

    // contract: cc902a2fb7798d9504ac09f4ff91492e002cb1db
    // contract: 05f979e1d4b8d226eb190164f8df4644beca695b
    // shard: e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2
    // TxHash: 7519afbc00aefa4f8b0acf84458cc23ce4753d37969fa19d30d2579bb0f9382c

    // {
    //   "address": "05f979e1d4b8d226eb190164f8df4644beca695b",
    //   "chainId": "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2",
    //   "createdAt": 1685969008
    // },
    // {
    //   "address": "66b198876b9e7448eea5b03a78682eb7cc28e59c",
    //   "chainId": "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2",
    //   "createdAt": 1686024518
    // },
    // {
    //   "address": "b0ba3c6357af18083ee0e414f808ea1702d4c3bd",
    //   "chainId": "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2",
    //   "createdAt": 1685979994
    // },
    // {
    //   "address": "cc902a2fb7798d9504ac09f4ff91492e002cb1db",
    //   "chainId": "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2",
    //   "createdAt": 1685966531
    // },
    // {
    //   "address": "e88222139a8b9b09ccdee0dbf5917a8705511093",
    //   "chainId": "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2",
    //   "createdAt": 1685980198
    // }

    const contractAddress = "66b198876b9e7448eea5b03a78682eb7cc28e59c";
    const chainID = "e267a05acf9785c72eb15f45118539635c253b28125503fcb6f436fa9b031db2";
    const toAddress = "e2f9682bf68c8c7b92822f9fac136b5ddf285061";
  
    async function getContract(admin, options: Options) {
        const contract = await rest.getContractsContract(admin, "StablyFiatToken", contractAddress, chainID, options)
        return contract;
    }

    let stablyContract;
    // it.skip("Create stably contract", async () => {
    //   const uid = util.uid();
    //   const constructorArgs = { var1 };
    //   const filename = `${fixtures}/all_StablyFiatToken_dependencies_safemath_inherited.sol`;
    //   const contractArgs = await factory.createContractFromFile(
    //     filename,
    //     uid,
    //     constructorArgs
    //   );

    //   stablyContract = await rest.createContract(admin, contractArgs, options);
    //   assert.equal(stablyContract.name, contractArgs.name, "name");
    //   assert.isOk(util.isAddress(stablyContract.address), "address");
    // })

    it.skip("get contracts", async () => {
      const [result] = await rest.getContracts(admin, chainID, options);
      console.log('result', JSON.stringify(result));
    });

    it.skip("add issuer", async () => {
      // get contract
      const contract = await getContract(admin, options);
      // call method
      const methodArgs = { newIssuer: hungAddress };
      const method = "addIssuer";
      const callArgs = {
        contract,
        method,
        args: methodArgs,
      };
      const [result] = await rest.call(admin, callArgs, {config, chainIds: chainID});
      console.log('result', result);
    })

    it.skip("call method", async () => {
      // get contract
      const contract = await getContract(admin, options);
      // call method
      const methodArgs = { to: toAddress, amount: 100000 };
      const method = "issueTo";
      const callArgs = factory.createCallArgs(contract, method, methodArgs);
      const [result] = await rest.call(admin, callArgs, {...options, chainIds: chainID});
      console.log('result', result);
    });

    it("call method sendRaw", async () => {
      // get contract
      const contract = await getContract(admin, options);
      // call method
      const methodArgs = { to: toAddress, amount: 100000, txParams: {nonce: 4} };
      const method = "issueTo";
      const callArgs = factory.createCallArgs(contract, method, methodArgs);
      const [result] = await rest.callBody(admin, callArgs, {
          ...options, 
          chainIds: chainID,
        });
      
      console.log('@@result', result);
      const raw = result.raw;
      const transactionRaw = {
          address: raw.from,
          "nonce": raw.nonce,
          "gasPrice": raw.gasPrice,
          "gasLimit": raw.gasLimit,
          "value": Number(raw.value),
          "to": raw.to,
          "initOrData": raw.codeOrData,
          "chainID": raw.chainId,
          "r": raw.r,
          "s": raw.s,
          "v": parseInt(raw.v, 16),
          "metadata": raw.metadata 
      };
      const [sendRawResult] = await rest.sendRaw(admin, transactionRaw, {...options, chainIds: chainID});
      console.log('sendRawResult', sendRawResult);
    });
});