import { Page } from '@playwright/test';

/**
 * API cleanup helpers for E2E tests
 * Ensures deterministic test state by cleaning up test data
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Get auth token from localStorage
 */
async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('accessToken'));
}

/**
 * Delete all polls for a specific group
 * @param page Playwright page instance (needs to be authenticated)
 * @param groupId Group ID to clean polls from
 */
export async function deleteGroupPolls(page: Page, groupId: string): Promise<void> {
  const token = await getAuthToken(page);
  if (!token) {
    throw new Error('No auth token found. Make sure page is authenticated.');
  }

  try {
    // Get all polls for the group
    const response = await page.request.get(`${API_BASE_URL}/polls?groupId=${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok()) {
      console.warn(`Failed to fetch polls for group ${groupId}: ${response.status()}`);
      return;
    }

    const polls = await response.json();

    // Delete each poll
    for (const poll of polls) {
      const deleteResponse = await page.request.delete(`${API_BASE_URL}/polls/${poll.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!deleteResponse.ok()) {
        console.warn(`Failed to delete poll ${poll.id}: ${deleteResponse.status()}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up polls:', error);
  }
}

/**
 * Get group ID by name
 * @param page Playwright page instance (needs to be authenticated)
 * @param groupName Name of the group
 * @returns Group ID or null if not found
 */
export async function getGroupIdByName(page: Page, groupName: string): Promise<string | null> {
  const token = await getAuthToken(page);
  if (!token) {
    throw new Error('No auth token found. Make sure page is authenticated.');
  }

  try {
    const response = await page.request.get(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok()) {
      console.warn(`Failed to fetch groups: ${response.status()}`);
      return null;
    }

    const groups = await response.json();
    const group = groups.find((g: { id: string; name: string }) => g.name === groupName);
    return group?.id || null;
  } catch (error) {
    console.error('Error fetching group:', error);
    return null;
  }
}

/**
 * Clean up test polls from Elite Strategy Players group
 * Use this in beforeEach for poll creation tests
 */
export async function cleanupEliteStrategyPlayersPolls(page: Page): Promise<void> {
  const groupId = await getGroupIdByName(page, 'Elite Strategy Players');
  if (groupId) {
    await deleteGroupPolls(page, groupId);
  }
}
