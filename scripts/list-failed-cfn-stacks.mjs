import { CloudFormationClient, ListStacksCommand } from '@aws-sdk/client-cloudformation';

const region = process.env.AWS_REGION || 'us-east-1';
const FAILED = [
  'CREATE_FAILED', 'UPDATE_FAILED', 'UPDATE_ROLLBACK_FAILED',
  'ROLLBACK_FAILED', 'DELETE_FAILED', 'ROLLBACK_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE',
];

const client = new CloudFormationClient({ region });

async function main() {
  const stacks = [];
  let nextToken;
  do {
    const res = await client.send(new ListStacksCommand({ StackStatusFilter: FAILED, NextToken: nextToken }));
    stacks.push(...(res.StackSummaries || []));
    nextToken = res.NextToken;
  } while (nextToken);

  const modeled = stacks.filter((s) => /modeled/i.test(s.StackName));
  console.log(`All failed stacks (${stacks.length} total):`);
  for (const s of stacks) console.log(`  ${s.StackName} — ${s.StackStatus}`);
  console.log(`\nModeled-related (${modeled.length}):`);
  for (const s of modeled) console.log(`  ${s.StackName} — ${s.StackStatus}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
