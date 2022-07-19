/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Screenshot } from "../e2eTestUtils/TestUtils";
import { Page, HTTPResponse } from "puppeteer";
import fs from "fs";

// Constants
export const SCREENSHOT_BASE_FOLDER_NAME = `${__dirname}/screenshots`;
export const SAMPLE_HOME_URL = "http://localhost";
export const SUCCESSFUL_GRAPH_CALL_ID = "graph-called-successfully";
export const SUCCESSFUL_SILENT_TOKEN_ACQUISITION_ID = "token-acquired-silently";
export const SUCCESSFUL_GET_ALL_ACCOUNTS_ID = "accounts-retrieved-successfully";

export async function enterCredentials(page: Page, screenshot: Screenshot, username: string, accountPwd: string): Promise<void> {
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}).catch(() => {}), // Wait for navigation but don't throw due to timeout
        page.waitForSelector("#i0116"),
        page.waitForSelector("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await screenshot.takeScreenshot(page, "loginPage");
    await page.type("#i0116", username);
    await screenshot.takeScreenshot(page, "loginPageUsernameFilled")
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"] }),
        page.click("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });

    // agce: which type of account do you want to use
    try {
        await page.waitForSelector('#aadTile', {timeout: 1000});
        await screenshot.takeScreenshot(page, "accountType");
        await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
            page.click("#aadTile")
        ]).catch(async (e) => {
            await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
            throw e;
        });
    } catch (e) {
        //
    }

    await page.waitForSelector("#idA_PWD_ForgotPassword");
    await page.waitForSelector("#i0118");
    await page.waitForSelector("#idSIButton9");
    await screenshot.takeScreenshot(page, "pwdInputPage");
    await page.type("#i0118", accountPwd);
    await screenshot.takeScreenshot(page, "loginPagePasswordFilled");
    await Promise.all([
        page.click("#idSIButton9"),

        // Wait either for another navigation to Keep me signed in page or back to redirectUri
        Promise.race([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"] }),
            page.waitForResponse((response: HTTPResponse) => response.url().startsWith(SAMPLE_HOME_URL), { timeout: 0 })
        ])
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });

    if (page.url().startsWith(SAMPLE_HOME_URL)) {
        return;
    }
    await screenshot.takeScreenshot(page, "passwordSubmitted")

    // agce: check if the "help us protect your account" dialog appears
    try {
        const selector = "#lightbox > div:nth-child(3) > div > div.pagination-view.has-identity-banner.animate.slide-in-next > div > div:nth-child(3) > a";
        await page.waitForSelector(selector, {timeout: 1000});
        await page.click(selector);
    } catch(e) {
        // continue
    }

    // keep me signed in page
    try {
        await page.waitForSelector('#idSIButton9', {timeout: 1000});
        await screenshot.takeScreenshot(page, "keepMeSignedInPage");
        await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
            page.click("#idSIButton9")
        ]).catch(async (e) => {
            await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
            throw e;
        });
    } catch (e) {
        return;
    }

    // agce: private tenant sign in page
    try {
        await page.waitForSelector('#idSIButton9', {timeout: 1000});
        await screenshot.takeScreenshot(page, "privateTenantSignInPage");
        await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
            page.click("#idSIButton9")
        ]).catch(async (e) => {
            await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
            throw e;
        });
    } catch (e) {
        return;
    }
}

export async function approveRemoteConnect(page: Page, screenshot: Screenshot): Promise<void> {
    try {
        await page.waitForSelector("#remoteConnectDescription");
        await page.waitForSelector("#remoteConnectSubmit");
        await screenshot.takeScreenshot(page, "remoteConnectPage");
        await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
            page.click("#remoteConnectSubmit")
        ]).catch(async (e) => {
            await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
            throw e;
        });
    } catch (e) {
        return;
    }
}

export async function enterCredentialsADFSWithConsent(page: Page, screenshot: Screenshot, username: string, accountPwd: string): Promise<void> {
    await enterCredentialsADFS(page, screenshot, username, accountPwd);
    await approveConsent(page, screenshot);
}

export async function approveConsent(page: Page, screenshot: Screenshot): Promise<void> {
    await page.waitForSelector("#idSIButton9");
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
        page.click("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await screenshot.takeScreenshot(page, 'consentApproved');
}

export async function clickSignIn(page: Page, screenshot: Screenshot): Promise<void> {
    await page.waitForSelector("#SignIn")
    await screenshot.takeScreenshot(page, "samplePageInit");
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
        page.click("#SignIn")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await screenshot.takeScreenshot(page, "signInClicked");
}

export async function enterCredentialsADFS(page: Page, screenshot: Screenshot, username: string, accountPwd: string): Promise<void> {
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}).catch(() => {}), // Wait for navigation but don't throw due to timeout
        page.waitForSelector("#i0116"),
        page.waitForSelector("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await screenshot.takeScreenshot(page, "loginPageADFS");
    await page.type("#i0116", username);
    await screenshot.takeScreenshot(page, "usernameEntered");
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
        page.click("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await page.waitForSelector("#passwordInput");
    await page.waitForSelector("#submitButton");
    await page.type("#passwordInput", accountPwd);
    await screenshot.takeScreenshot(page, "passwordEntered");
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
        page.click("#submitButton")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
    await screenshot.takeScreenshot(page, "pwdSubmitted");
}

export async function enterDeviceCode(page: Page, screenshot: Screenshot, code: string, deviceCodeUrl: string): Promise<void> {
    await page.goto(deviceCodeUrl, {waitUntil: ["load", "domcontentloaded", "networkidle0"]});
    await page.waitForSelector("#otc");
    await page.waitForSelector("#idSIButton9");
    await screenshot.takeScreenshot(page, 'deviceCodePage');
    await page.type("#otc", code);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ["load", "domcontentloaded", "networkidle0"]}),
        page.click("#idSIButton9")
    ]).catch(async (e) => {
        await screenshot.takeScreenshot(page, "errorPage").catch(() => {});
        throw e;
    });
}

export async function b2cAadPpeAccountEnterCredentials(page: Page, screenshot: Screenshot, username: string, accountPwd: string): Promise<void> {
    await page.waitForSelector("#MSIDLAB4_AzureAD");
    await screenshot.takeScreenshot(page, "b2cSignInPage");
    // Select Lab Provider
    await page.click("#MSIDLAB4_AzureAD");
    // Enter credentials
    await enterCredentials(page, screenshot, username, accountPwd);
}

export async function b2cMsaAccountEnterCredentials(page: Page, screenshot: Screenshot, username: string, accountPwd: string): Promise<void> {
    await page.waitForSelector("#MicrosoftAccountExchange");
    await screenshot.takeScreenshot(page, "b2cSignInPage");
    // Select Lab Provider
    await page.click("#MicrosoftAccountExchange");
    // Enter credentials
    await enterCredentials(page, screenshot, username, accountPwd);
}

export async function b2cLocalAccountEnterCredentials(page: Page, screenshot: Screenshot, username: string, accountPwd: string) {
    await page.waitForSelector("#logonIdentifier");
    await screenshot.takeScreenshot(page, "b2cSignInPage");
    await page.type("#logonIdentifier", username);
    await page.type("#password", accountPwd);
    await page.click("#next");
}

export async function validateCacheLocation(cacheLocation: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.readFile(cacheLocation, "utf-8", (err, data) => {
            if (err || data === "") {
                fs.writeFile(cacheLocation, "{}", (error) => {
                    if (error) {
                        console.log("Error writing to cache file: ", error);
                        reject();
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

export function checkTimeoutError(output: string): boolean {
    const timeoutErrorRegex = /user_timeout_reached/;
    return timeoutErrorRegex.test(output);
}
