/**
 * Production Poll Import Script
 *
 * This script imports Firebase polls directly to your production database.
 * It uses environment variables for production database connection.
 *
 * Usage:
 *   npm run import:prod
 *
 * Environment variables required (from .env):
 *   SUPABASE_DB_URL - Production database connection string
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import type { PollStatus } from '../src/domains/polls/models/poll';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, 'firebase-polls-backup-2025-11-09.json');
const USER_ID = '65ad226e-e3c1-4e7f-a96d-a84156589733';

const mapAnswerType = (firebaseType: string): 'single' | 'multiple' => {
	const typeMap: Record<string, 'single' | 'multiple'> = {
		radio: 'single',
		checkbox: 'multiple',
	};
	return typeMap[firebaseType] || 'single';
};

const normalizeCategoryCode = (firebaseCategory: string): string => {
	const categoryMap: Record<string, string> = {
		typescript: 'ts',
		javascript: 'js',
	};
	return categoryMap[firebaseCategory] || firebaseCategory;
};

const shouldSkipCategory = (category?: string): boolean => {
	const skipCategories = ['next', 'nextjs', 'next.js', 'flutter'];
	return skipCategories.includes(category?.toLowerCase() || '');
};

const normalizePollStatus = (firebaseStatus?: string): PollStatus => {
	const statusMap: Record<string, PollStatus> = {
		new: 'draft',
		draft: 'draft',
		open: 'published',
		closed: 'published',
		archived: 'archived',
		'needs-revision': 'draft',
	};
	return statusMap[firebaseStatus?.toLowerCase() || ''] || 'published';
};

async function importToProduction() {
	// Check for production database URL
	const dbUrl = process.env.SUPABASE_DB_URL;

	if (!dbUrl) {
		console.error('❌ Error: SUPABASE_DB_URL environment variable not set!');
		console.log('\nPlease set your production database URL:');
		console.log('  export SUPABASE_DB_URL="your-production-connection-string"');
		console.log('\nOr uncomment the PROD section in your .env file');
		process.exit(1);
	}

	// Confirm production import
	console.log('⚠️  WARNING: This will import polls to PRODUCTION database!');
	console.log(`📍 Database: ${dbUrl.split('@')[1]?.split('/')[0] || 'production'}`);
	console.log('\n🔄 Reading Firebase backup...');

	const rawData = readFileSync(INPUT_FILE, 'utf8');
	const allPolls = JSON.parse(rawData);

	console.log(`📊 Found ${allPolls.length} total polls`);

	const filteredPolls = allPolls.filter(
		(poll: any) => !shouldSkipCategory(poll.category)
	);

	console.log(`🚫 Filtered out ${allPolls.length - filteredPolls.length} polls (Next.js, Flutter)`);
	console.log(`✂️  Processing ${filteredPolls.length} polls...\n`);

	// Connect to production database
	const sql = postgres(dbUrl);

	let importedCount = 0;
	let skippedCount = 0;

	try {
		for (const poll of filteredPolls) {
			// Skip polls without valid questions
			if (!poll.question || typeof poll.question !== 'string') {
				skippedCount++;
				continue;
			}

			try {
				const openingTime = poll.openingTime
					? new Date(poll.openingTime)
					: new Date();

				// Insert poll using parameterized query
				const [insertedPoll] = await sql`
					INSERT INTO polls (
						question,
						poll_number,
						code_block,
						code_sandbox_example,
						status,
						answer_type,
						opening_time,
						closing_time,
						created_by,
						category_code
					) VALUES (
						${poll.question},
						${poll.pollNumber || null},
						${poll.codeBlock || null},
						${poll.codeSandboxExample || null},
						${normalizePollStatus(poll.status)},
						${mapAnswerType(poll.type)},
						${openingTime},
						${openingTime},
						${USER_ID},
						${normalizeCategoryCode(poll.category || 'general')}
					)
					RETURNING id
				`;

				// Insert poll options
				if (poll.answers && poll.answers.length > 0) {
					const correctAnswerIds = new Set(
						(poll.correctAnswers || []).map((ans: any) => ans.id)
					);

					for (const answer of poll.answers) {
						await sql`
							INSERT INTO polls_options (poll_id, option, correct)
							VALUES (
								${insertedPoll.id},
								${answer.value},
								${correctAnswerIds.has(answer.id)}
							)
						`;
					}
				}

				importedCount++;

				if (importedCount % 50 === 0) {
					console.log(`   ✓ Imported ${importedCount} polls...`);
				}
			} catch (error) {
				console.error(
					`❌ Error importing poll "${poll.question.substring(0, 50)}...":`,
					error instanceof Error ? error.message : error
				);
				skippedCount++;
			}
		}

		await sql.end();

		console.log(`\n✅ Successfully imported ${importedCount} polls to PRODUCTION!`);
		if (skippedCount > 0) {
			console.log(`⚠️  Skipped ${skippedCount} polls due to errors`);
		}

		process.exit(0);
	} catch (error) {
		console.error('❌ Fatal error:', error);
		await sql.end();
		process.exit(1);
	}
}

importToProduction();
