import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function compileAssignments({ tasks, proposals }) {
  if (!Array.isArray(tasks) || !Array.isArray(proposals) ||
      tasks.length < 1 || tasks.length > 44 || proposals.length !== tasks.length) {
    throw Error('Expected matching batches of 1 to 44 assignments and proposals');
  }

  return tasks.map((task, index) => {
    const { position, client, operation, operand } = task ?? {};
    if (position !== index + 1 || !['mike', 'juan', 'missy', 'darcy'].includes(client) ||
        !['add', 'multiply'].includes(operation) || !Number.isInteger(operand) ||
        Math.abs(operand) > 1000) {
      throw Error('Invalid synthetic assignment at position ' + (index + 1));
    }
    const proposal = proposals[index];
    if (!Array.isArray(proposal) || proposal.length !== 3 ||
        proposal[0] !== position || proposal[1] !== operation || proposal[2] !== operand) {
      throw Error('Proposal failed verification at position ' + position);
    }
    const operator = operation === 'add' ? '+' : '*';
    return 'export function task' + position + '(value) { return value ' + operator + ' (' + operand + '); }';
  }).join('\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) throw Error('Provide exactly one assignment manifest');
  process.stdout.write(compileAssignments(JSON.parse(readFileSync(process.argv[2], 'utf8'))));
}
