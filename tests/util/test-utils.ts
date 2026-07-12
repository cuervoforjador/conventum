import {ElementHandle, Page} from '@playwright/test';

export type DomElementHandle = ElementHandle<SVGElement | HTMLElement>;

/**
 * Waits for a single DOM element matching the given selector and returns it.
 */
export async function getSingleDomElement(
    page: Page,
    domElementSelector: string
): Promise<DomElementHandle> {
    return await page.waitForSelector(domElementSelector);
}

/**
 * Returns all DOM elements on the page matching the given selector.
 */
export async function getAllDomElements(
    page: Page,
    domElementSelector: string
): Promise<DomElementHandle[]> {
    return await page.$$(domElementSelector);
}

/**
 * Returns child DOM elements of the given parent element.
 * Defaults to all direct children (`:scope > *`).
 */
export async function getChildDomElements(
    parent: DomElementHandle,
    childSelector: string = ':scope > *'
): Promise<DomElementHandle[]> {
    return await parent.$$(childSelector);
}

/**
 * Finds the first element whose given attribute equals the expected value.
 */
export async function findByAttribute(
    attribute: string,
    attributeValue: string,
    elements: DomElementHandle[]
): Promise<DomElementHandle | undefined> {
    const elementsWithAttribute = await Promise.all(
        elements.map(async (element) => ({
            element,
            value: await element.getAttribute(attribute),
        }))
    );

    return elementsWithAttribute.find((entry) => entry.value === attributeValue)?.element;
}

/**
 * Filters elements by whether they contain a descendant matching the given CSS selector.
 */
export async function filterByDescendant(
    elements: DomElementHandle[],
    descendantSelector: string
): Promise<DomElementHandle[]> {
    const matches = await Promise.all(
        elements.map(async (element) => ({
            element,
            hasDescendant: (await element.$(descendantSelector)) !== null,
        }))
    );

    return matches
        .filter((entry) => entry.hasDescendant)
        .map((entry) => entry.element);
}