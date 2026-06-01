import { randomUUID } from 'node:crypto';

export function generateTaskId(): string {
  const uuid = randomUUID().replace(/-/g, '');
  return `t_${uuid.slice(0, 6)}`;
}
