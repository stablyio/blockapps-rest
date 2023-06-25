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
import oauthHelper from "../util/oauthHelper";
import { AccessToken } from "../util/oauth.util";

if (!process.env.USER_TOKEN) {
  const loadEnv = dotenv.config();
  assert.isUndefined(loadEnv.error);
}

const config = factory.getTestConfig();

describe("auth", function () {
  this.timeout(config.timeout);
  let admin;
  const options: Options = { config };
  
    it('get token', async () => {
        let adminUserName = process.env.GLOBAL_ADMIN_NAME
        let adminUserPassword = process.env.GLOBAL_ADMIN_PASSWORD
    
        let adminUserToken
        adminUserToken = await oauthHelper.getUserToken(adminUserName, adminUserPassword, config)
        // assert.
        assert.isNotEmpty(adminUserToken)
        console.log('admin user token', adminUserToken);
    })
})