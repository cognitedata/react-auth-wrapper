import * as Mocha from "mocha";
import puppeteer from "puppeteer";
import { expect } from "chai";
import fs from "fs";
import { LabClient, ILabApiParams } from "../../../e2eTests/LabClient";

const SCREENSHOT_BASE_FOLDER_NAME = `${__dirname}/screenshots`;
let SCREENSHOT_NUM = 0;
let username = "";
let accountPwd = "";

function setupScreenshotDir() {
    if (!fs.existsSync(`${SCREENSHOT_BASE_FOLDER_NAME}`)) {
        fs.mkdirSync(SCREENSHOT_BASE_FOLDER_NAME);
    }
}

async function setupCredentials() {
    const testCreds = new LabClient();
    const userParams: ILabApiParams = {azureEnvironment: "azureppe"};
    const envResponse = await testCreds.getUserVarsByCloudEnvironment(userParams);
    const testEnv = envResponse[0];
    if (testEnv.upn) {
        username = testEnv.upn;
    }

    const testPwdSecret = await testCreds.getSecret(testEnv.labName);

    accountPwd = testPwdSecret.value;
}

async function takeScreenshot(page: puppeteer.Page, testName: string, screenshotName: string): Promise<void> {
    const screenshotFolderName = `${SCREENSHOT_BASE_FOLDER_NAME}/${testName}`;
    if (!fs.existsSync(`${screenshotFolderName}`)) {
        fs.mkdirSync(screenshotFolderName);
    }
    await page.screenshot({ path: `${screenshotFolderName}/${++SCREENSHOT_NUM}_${screenshotName}.png` });
}

async function enterCredentials(page: puppeteer.Page, testName: string): Promise<void> {
    await page.waitForNavigation({ waitUntil: "networkidle0"});
    await page.waitForSelector("#i0116");
    await takeScreenshot(page, testName, "loginPage");
    await page.type("#i0116", username);
    await page.click("#idSIButton9");
    await page.waitForSelector("#idA_PWD_ForgotPassword");
    await takeScreenshot(page, testName, "pwdInputPage");
    await page.type("#i0118", accountPwd);
    await page.click("#idSIButton9");
}

describe("Browser tests", function () {
    this.timeout(15000);
    this.retries(1);

    let browser: puppeteer.Browser;
    before(async () => {
        setupScreenshotDir();
        setupCredentials();
        browser = await puppeteer.launch({
            headless: true,
            ignoreDefaultArgs: ["--no-sandbox", "–disable-setuid-sandbox"]
        });
    });

    let context: puppeteer.BrowserContext;
    let page: puppeteer.Page;
    beforeEach(async () => {
        SCREENSHOT_NUM = 0;
        context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
        await page.goto("http://localhost:30662/");
    });

    afterEach(async () => {
        await page.close();
    });

    after(async () => {
        await context.close();
        await browser.close();
    });

    it("Performs loginPopup then acquireTokenRedirect", async () => {
        const testName = "acquireTokenRedirectBaseCase";
        // Home Page
        await takeScreenshot(page, testName, "samplePageInit");
        // Click Sign In
        await page.click("#SignIn");
        await takeScreenshot(page, testName, "signInClicked");
        // Click Sign In With Popup
        const newPopupWindowPromise = new Promise<puppeteer.Page>(resolve => page.once("popup", resolve));
        await page.click("#loginPopup");
        const popupPage = await newPopupWindowPromise;
        const popupWindowClosed = new Promise<void>(resolve => popupPage.once("close", resolve));
        // Enter credentials
        await enterCredentials(popupPage, testName);
        // Wait until popup window closes and see that we are logged in
        await popupWindowClosed;
        await takeScreenshot(page, testName, "samplePageLoggedIn");
        let localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(5);
        expect(popupPage.isClosed()).to.be.true;

        // Acquire Access Token using acquireTokenRedirect
        await page.click("#seeProfileRedirect");
        await page.waitForSelector("#profile-info");
        await takeScreenshot(page, testName, "samplePageGotToken");
        localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(6);
    });

    it("Performs loginPopup then acquireTokenRedirect from page with custom hash", async () => {
        const customHashPage = "http://localhost:30662/#testHash";
        await page.goto(customHashPage);
        const testName = "acquireTokenRedirectCustomHashCase";
        // Home Page
        await takeScreenshot(page, testName, "samplePageInit");
        // Click Sign In
        await page.click("#SignIn");
        await takeScreenshot(page, testName, "signInClicked");
        // Click Sign In With Popup
        const newPopupWindowPromise = new Promise<puppeteer.Page>(resolve => page.once("popup", resolve));
        await page.click("#loginPopup");
        const popupPage = await newPopupWindowPromise;
        const popupWindowClosed = new Promise<void>(resolve => popupPage.once("close", resolve));
        // Enter credentials
        await enterCredentials(popupPage, testName);
        // Wait until popup window closes and see that we are logged in
        await popupWindowClosed;
        await takeScreenshot(page, testName, "samplePageLoggedIn");
        let localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(5);
        expect(popupPage.isClosed()).to.be.true;

        // Acquire Access Token using acquireTokenRedirect
        await page.click("#seeProfileRedirect");
        await page.waitForSelector("#profile-info");
        await takeScreenshot(page, testName, "samplePageGotToken");
        localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(6);
        expect(page.url()).to.be.eq(customHashPage);
    });

    it("Performs loginPopup then acquireTokenRedirect from page with custom query params", async () => {
        const customQueryPage = "http://localhost:30662/?testQueryParam=test";
        await page.goto(customQueryPage);
        const testName = "acquireTokenRedirectCustomQueryCase";
        // Home Page
        await takeScreenshot(page, testName, "samplePageInit");
        // Click Sign In
        await page.click("#SignIn");
        await takeScreenshot(page, testName, "signInClicked");
        // Click Sign In With Popup
        const newPopupWindowPromise = new Promise<puppeteer.Page>(resolve => page.once("popup", resolve));
        await page.click("#loginPopup");
        const popupPage = await newPopupWindowPromise;
        const popupWindowClosed = new Promise<void>(resolve => popupPage.once("close", resolve));
        // Enter credentials
        await enterCredentials(popupPage, testName);
        // Wait until popup window closes and see that we are logged in
        await popupWindowClosed;
        await takeScreenshot(page, testName, "samplePageLoggedIn");
        let localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(5);
        expect(popupPage.isClosed()).to.be.true;

        // Acquire Access Token using acquireTokenRedirect
        await page.click("#seeProfileRedirect");
        await page.waitForSelector("#profile-info");
        await takeScreenshot(page, testName, "samplePageGotToken");
        localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(6);
        expect(page.url()).to.be.eq(customQueryPage);
    });

    it("Performs loginPopup then acquireTokenPopup", async () => {
        const testName = "acquireTokenPopupBaseCase";
        // Home Page
        await takeScreenshot(page, testName, "samplePageInit");
        // Click Sign In
        await page.click("#SignIn");
        await takeScreenshot(page, testName, "signInClicked");
        // Click Sign In With Popup
        const newPopupWindowPromise = new Promise<puppeteer.Page>(resolve => page.once("popup", resolve));
        await page.click("#loginPopup");
        const popupPage = await newPopupWindowPromise;
        const popupWindowClosed = new Promise<void>(resolve => popupPage.once("close", resolve));
        // Enter credentials
        await enterCredentials(popupPage, testName);
        // Wait until popup window closes and see that we are logged in
        await popupWindowClosed;
        await takeScreenshot(page, testName, "samplePageLoggedIn");
        let localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(5);
        expect(popupPage.isClosed()).to.be.true;

        // Acquire Access Token using acquireTokenPopup
        await page.click("#seeProfilePopup");
        await page.waitForSelector("#profile-info");

        await takeScreenshot(page, testName, "samplePageGotToken");
        localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        expect(Object.keys(localStorage).length).to.be.eq(6);
    });
});
