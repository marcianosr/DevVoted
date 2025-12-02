import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/database/db';
import { pollsTable, pollOptionsTable } from '../src/database/schema';

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

const normalizePollStatus = (firebaseStatus?: string): 'draft' | 'open' | 'closed' | 'archived' => {
	const statusMap: Record<string, 'draft' | 'open' | 'closed' | 'archived'> = {
		new: 'draft',
		draft: 'draft',
		open: 'open',
		closed: 'closed',
		archived: 'archived',
		'needs-revision': 'draft',
	};
	return statusMap[firebaseStatus?.toLowerCase() || ''] || 'closed';
};

async function importFirebasePolls() {
	console.log('🔄 Reading Firebase backup...');
	const rawData = readFileSync(INPUT_FILE, 'utf8');
	const allPolls = JSON.parse(rawData);

	console.log(`📊 Found ${allPolls.length} total polls`);

	const filteredPolls = allPolls.filter(
		(poll: any) => !shouldSkipCategory(poll.category)
	);
	console.log(
		`🚫 Filtered out ${allPolls.length - filteredPolls.length} Next.js polls`
	);
	console.log(`✂️  Processing ${filteredPolls.length} polls...`);

	let importedCount = 0;
	let skippedCount = 0;

	for (const poll of filteredPolls) {
		// Skip polls without valid questions
		if (!poll.question || typeof poll.question !== 'string') {
			console.warn(`⚠️  Skipping poll: Missing or invalid question`);
			skippedCount++;
			continue;
		}

		try {
			const openingTime = poll.openingTime
				? new Date(poll.openingTime)
				: new Date();

			// Insert poll using Drizzle ORM (handles all escaping automatically)
			const [insertedPoll] = await db
				.insert(pollsTable)
				.values({
					question: poll.question,
					poll_number: poll.pollNumber || null,
					code_block: poll.codeBlock || null,
					code_sandbox_example: poll.codeSandboxExample || null,
					status: normalizePollStatus(poll.status),
					answer_type: mapAnswerType(poll.type),
					opening_time: openingTime,
					closing_time: openingTime,
					created_by: USER_ID,
					category_code: normalizeCategoryCode(poll.category || 'general'),
				})
				.returning({ id: pollsTable.id });

			// Insert poll options
			if (poll.answers && poll.answers.length > 0) {
				const correctAnswerIds = new Set(
					(poll.correctAnswers || []).map((ans: any) => ans.id)
				);

				const options = poll.answers.map((answer: any) => ({
					poll_id: insertedPoll.id,
					option: answer.value,
					correct: correctAnswerIds.has(answer.id),
				}));

				await db.insert(pollOptionsTable).values(options);
			}

			importedCount++;

			if (importedCount % 50 === 0) {
				console.log(`   ✓ Imported ${importedCount} polls...`);
			}
		} catch (error) {
			console.error(`❌ Error importing poll "${poll.question.substring(0, 50)}...":`, error);
			skippedCount++;
		}
	}

	console.log(`\n✅ Successfully imported ${importedCount} polls!`);
	if (skippedCount > 0) {
		console.log(`⚠️  Skipped ${skippedCount} polls due to errors`);
	}

	process.exit(0);
}

importFirebasePolls().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
