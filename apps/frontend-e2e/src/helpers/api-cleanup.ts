import { Page } from '@playwright/test';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API cleanup helpers for E2E tests
 * Ensures deterministic test state by cleaning up test data
 */

const API_BASE_URL = 'http://localhost:3000/api';
const LOCK_ROOT = path.join(os.tmpdir(), 'barades-e2e-locks');
const LOCK_TTL_MS = 15_000;

async function acquireLock(lockName: string): Promise<() => Promise<void>> {
  await fs.mkdir(LOCK_ROOT, { recursive: true });
  const lockPath = path.join(LOCK_ROOT, `${lockName}.lock`);

  while (true) {
    try {
      const handle = await fs.open(lockPath, 'wx');
      await handle.writeFile(JSON.stringify({ pid: process.pid, ts: Date.now() }));
      return async () => {
        try {
          await handle.close();
        } finally {
          await fs.unlink(lockPath).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') {
              throw error;
            }
          });
        }
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') {
        throw error;
      }

      const stat = await fs.stat(lockPath).catch(() => null);
      let stale = false;

      if (!stat) {
        stale = true;
      } else if (Date.now() - stat.mtimeMs > LOCK_TTL_MS) {
        stale = true;
      } else {
        const content = await fs.readFile(lockPath, 'utf8').catch(() => null);
        if (content) {
          try {
            const data = JSON.parse(content) as { pid?: number };
            if (typeof data.pid === 'number') {
              try {
                process.kill(data.pid, 0);
              } catch {
                stale = true;
              }
            }
          } catch {
            stale = true;
          }
        }
      }

      if (stale) {
        await fs.unlink(lockPath).catch(() => undefined);
        continue;
      }

      await sleep(50);
    }
  }
}

export async function acquireEliteStrategyPlayersLock(): Promise<() => Promise<void>> {
  return acquireLock('elite-strategy-players');
}

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

  const headers = {
    Authorization: `Bearer ${token}`,
  } as const;

  const fetchPollIds = async (): Promise<string[]> => {
    const response = await page.request.get(`${API_BASE_URL}/polls?groupId=${groupId}`, {
      headers,
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch polls for group ${groupId}: ${response.status()}`);
    }

    const polls = (await response.json()) as Array<{ id: string }>;
    return Array.from(new Set(polls.map(poll => poll.id)));
  };

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const pollIds = await fetchPollIds();
    
    if (pollIds.length === 0) {
      return;
    }

    await Promise.all(
      pollIds.map(async (pollId) => {
        const deleteResponse = await page.request.delete(`${API_BASE_URL}/polls/${pollId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!deleteResponse.ok() && deleteResponse.status() !== 404) {
          console.error(
            `Failed to delete poll ${pollId}:`,
            deleteResponse.status(),
            await deleteResponse.text()
          );
        }
      })
    );

    if (attempt < maxRetries - 1) {
      await sleep(100);
    }
  }

  const remaining = await fetchPollIds();
  if (remaining.length > 0) {
    throw new Error(`Cleanup failed: ${remaining.length} poll(s) still present in group ${groupId}.`);
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
 * 
 * Note: Backend DELETE is idempotent - returns 200 even if poll already deleted.
 * This handles parallel test execution gracefully.
 */
export async function cleanupEliteStrategyPlayersPolls(page: Page): Promise<void> {
  const groupId = await getGroupIdByName(page, 'Elite Strategy Players');
  if (!groupId) return;

  await deleteGroupPolls(page, groupId);
  
  // Verify cleanup succeeded by checking API
  const token = await getAuthToken(page);
  if (!token) return;

  const fetchRemainingPolls = async (): Promise<Array<{ id: string }>> => {
    const response = await page.request.get(`${API_BASE_URL}/polls?groupId=${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok()) {
      console.warn(`Failed to verify poll cleanup for group ${groupId}: ${response.status()}`);
      return [];
    }

    return (await response.json()) as Array<{ id: string }>;
  };

  let remainingPolls = await fetchRemainingPolls();
  if (remainingPolls.length === 0) {
    return;
  }

  await Promise.all(
    remainingPolls.map((poll) =>
      page.request.delete(`${API_BASE_URL}/polls/${poll.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      })
    )
  );

  remainingPolls = await fetchRemainingPolls();
  if (remainingPolls.length === 0) {
    return;
  }

  await deleteGroupPolls(page, groupId);

  remainingPolls = await fetchRemainingPolls();
  if (remainingPolls.length > 0) {
    console.warn(`⚠️  Cleanup incomplete: ${remainingPolls.length} poll(s) still exist in Elite Strategy Players`);
  }
}
