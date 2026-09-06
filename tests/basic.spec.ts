import {test, expect, chromium, Browser, Page} from '@playwright/test';
import * as TestUtils from './util/test-utils';

const ADMINISTRATOR_PASSWORD = '123';
const BASE_FOUNDRYVTT_URL = 'http://localhost:30000/setup';

test('has title', async ({page}) => {
    await page.goto(BASE_FOUNDRYVTT_URL);
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Foundry Virtual Tabletop/);
});

test('aquelarre system installed', async ({page}) => {

    // LOAD AND LOGIN
    const browser = await chromium.launch({headless: false});
    const foundryPage = await load(browser);
    await login(foundryPage);

    // SETUP SCREEN

    // Dismiss Backup dialog in case is displayed
    await foundryPage.locator('a[data-action="exit"]').click();
    // Go to systems tab
    await foundryPage.locator('h2[data-tab="systems"]').click();
    // Wait for systems list to be visible
    await foundryPage.waitForSelector('ol[id="systems-list"]');

    // Fetch systems list
    const systemList = TestUtils.getSingleDomElement(foundryPage, 'ol[id="systems-list"]');

    // Expect the system list to exist and be visible.
    expect(systemList).not.toBeNull();

    // Fetch Aquelarre system
    const akerSystemPackage = await TestUtils.getSingleDomElement(foundryPage, 'li[data-package-id="aquelarre"]');

    // Expect the Aquelarre system package to exist and be visible.
    expect(akerSystemPackage).not.toBeNull();
    expect(await akerSystemPackage.isVisible()).toBe(true);
});

test('aquelarre package world element exists', async ({page}) => {

    // LOAD AND LOGIN
    const browser = await chromium.launch({headless: false});
    const foundryPage = await load(browser);
    await login(foundryPage);

    // SETUP SCREEN

    // Dismiss Backup dialog in case is displayed
    await foundryPage.locator('a[data-action="exit"]').click();
    // Go to systems tab
    await foundryPage.locator('h2[data-tab="worlds"]').click();
    // Wait for systems list to be visible
    await foundryPage.waitForSelector('ol[id="worlds-list"]');

    // Fetch world list
    const worldsList =
        await TestUtils.getAllDomElements(foundryPage, 'ol[id="worlds-list"]');
    expect(worldsList).toHaveLength(1);

    const worldsListLiChildren = await TestUtils.getChildDomElements(worldsList[0], 'li');

    // Filter the already-fetched <li> children by descendant <img> src.
    const targetSrc = 'systems/aquelarre/assets/ui/systemBackground.png';
    const matchingLis = await TestUtils.filterByDescendant(
        worldsListLiChildren,
        `img[src="${targetSrc}"]`
    );    

    expect(matchingLis.length).toBeGreaterThan(0);
});

// UI HELPERS
async function load(browser: Browser): Promise<Page> {
    const foundryPage = await browser.newPage();
    await foundryPage.goto(BASE_FOUNDRYVTT_URL);
    return foundryPage;
}

async function login(foundryPage: Page): Promise<void> {
    await foundryPage.waitForSelector('label[class="password"]');
    await foundryPage.getByPlaceholder('Administrator Password').fill(ADMINISTRATOR_PASSWORD);
    await foundryPage.getByRole('button', {name: /Log In/}).click();
}