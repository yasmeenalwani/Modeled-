/**
 * Delete failed CloudFormation stacks matching amplify-Modeled-*
 * Usage: node scripts/delete-failed-amplify-stacks.mjs [--dry-run]
 */
import {
  CloudFormationClient,
  ListStacksCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';

const region = process.env.AWS_REGION || 'us-east-1';
const dryRun = process.argv.includes('--dry-run');

const FAILED_STATUSES = new Set([
  'CREATE_FAILED',
  'UPDATE_FAILED',
  'UPDATE_ROLLBACK_FAILED',
  'ROLLBACK_FAILED',
  'DELETE_FAILED',
  'ROLLBACK_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE',
]);

const client = new CloudFormationClient({ region });

async function listCandidateStacks() {
  const stacks = [];
  let nextToken;

  do {
    const res = await client.send(
      new ListStacksCommand({
        StackStatusFilter: [...FAILED_STATUSES],
        NextToken: nextToken,
      })
    );
    for (const s of res.StackSummaries || []) {
      if (s.StackName?.startsWith('amplify-Modeled')) {
        stacks.push(s);
      }
    }
    nextToken = res.NextToken;
  } while (nextToken);

  return stacks;
}

async function deleteStack(name) {
  if (dryRun) {
    console.log(`[dry-run] Would delete: ${name}`);
    return;
  }
  console.log(`Deleting: ${name}...`);
  await client.send(new DeleteStackCommand({ StackName: name }));
}

async function main() {
  console.log(`Region: ${region}${dryRun ? ' (dry-run)' : ''}`);
  const stacks = await listCandidateStacks();

  if (stacks.length === 0) {
    console.log('No failed amplify-Modeled-* stacks found.');
    return;
  }

  console.log(`Found ${stacks.length} stack(s):`);
  for (const s of stacks) {
    console.log(`  - ${s.StackName} (${s.StackStatus})`);
  }

  for (const s of stacks) {
    await deleteStack(s.StackName);
  }

  if (!dryRun) {
    console.log('Delete initiated. Stacks may take several minutes to remove in CloudFormation.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
