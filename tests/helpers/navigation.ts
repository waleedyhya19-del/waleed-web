import { Page } from '@playwright/test';

export async function gotoRoute(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    if (
      error instanceof Error &&
      /(ERR_ABORTED|frame was detached)/i.test(error.message)
    ) {
      return;
    }

    throw error;
  }
}
