import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, 'firebase-polls-backup-2025-11-09.json');
const OUTPUT_FILE = join(__dirname, 'migration-firebase-polls.sql');
const POLLS_TO_PROCESS = null; // null = process all polls
const USER_ID = '65ad226e-e3c1-4e7f-a96d-a84156589733';

const mapAnswerType = (firebaseType) => {
	const typeMap = {
		radio: 'single',
		checkbox: 'multiple',
	};
	return typeMap[firebaseType] || 'single';
};

const formatTimestamp = (unixTimestamp) => {
	if (!unixTimestamp) {
		return new Date().toISOString();
	}
	return new Date(unixTimestamp).toISOString();
};

const escapeSQL = (str) => {
	if (!str) return '';
	// Convert to string if it's not already
	const stringValue = typeof str === 'string' ? str : String(str);
	// Escape single quotes and newlines for PostgreSQL
	return stringValue.replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
};

const generatePollInserts = (polls) => {
	const sqlStatements = [];

	sqlStatements.push('-- Migration from Firebase to PostgreSQL');
	sqlStatements.push(`-- User ID: ${USER_ID}`);
	sqlStatements.push('');
	sqlStatements.push('BEGIN;');
	sqlStatements.push('');

	polls.forEach((poll, index) => {
		// Skip polls without valid questions
		if (!poll.question || typeof poll.question !== 'string') {
			console.warn(
				`⚠️  Skipping poll ${index + 1}: Missing or invalid question`
			);
			return;
		}

		const questionEscaped = escapeSQL(poll.question);
		const status = normalizePollStatus(poll.status);
		const answerType = mapAnswerType(poll.type);
		const openingTime = formatTimestamp(poll.openingTime);
		const closingTime = openingTime; // Same as opening time per user preference
		const categoryCode = normalizeCategoryCode(poll.category || 'general');
		const pollNumber = poll.pollNumber || null;
		const codeBlock = poll.codeBlock ? escapeSQL(poll.codeBlock) : null;
		const codeSandboxExample = poll.codeSandboxExample
			? escapeSQL(poll.codeSandboxExample)
			: null;

		sqlStatements.push(`-- Poll ${index + 1}: ${poll.question.substring(0, 60)}...`);
		sqlStatements.push(
			`INSERT INTO polls (question, poll_number, code_block, code_sandbox_example, status, answer_type, opening_time, closing_time, created_by, category_code) VALUES`
		);
		sqlStatements.push(
			`  ('${questionEscaped}', ${pollNumber}, ${codeBlock ? `'${codeBlock}'` : 'NULL'}, ${codeSandboxExample ? `'${codeSandboxExample}'` : 'NULL'}, '${status}', '${answerType}', '${openingTime}', '${closingTime}', '${USER_ID}', '${categoryCode}');`
		);
		sqlStatements.push('');

		// Get the correct answer IDs for comparison
		const correctAnswerIds = new Set(
			(poll.correctAnswers || []).map((ans) => ans.id)
		);

		// Generate option inserts
		if (poll.answers && poll.answers.length > 0) {
			sqlStatements.push('-- Options for the above poll');
			poll.answers.forEach((answer, answerIndex) => {
				const optionEscaped = escapeSQL(answer.value);
				const isCorrect = correctAnswerIds.has(answer.id);

				sqlStatements.push(
					`INSERT INTO polls_options (poll_id, option, correct) VALUES`
				);
				sqlStatements.push(
					`  ((SELECT id FROM polls ORDER BY id DESC LIMIT 1), '${optionEscaped}', ${isCorrect});`
				);
			});
			sqlStatements.push('');
		}
	});

	sqlStatements.push('COMMIT;');
	sqlStatements.push('');
	sqlStatements.push('-- Migration complete!');
	sqlStatements.push(`-- Generated ${polls.length} polls with their options`);

	return sqlStatements.join('\n');
};

const shouldSkipCategory = (category) => {
	const skipCategories = ['next', 'nextjs', 'next.js'];
	return skipCategories.includes(category?.toLowerCase());
};

const normalizeCategoryCode = (firebaseCategory) => {
	const categoryMap = {
		typescript: 'ts',
		javascript: 'js',
	};
	return categoryMap[firebaseCategory] || firebaseCategory;
};

const normalizePollStatus = (firebaseStatus) => {
	const statusMap = {
		new: 'draft',
		draft: 'draft',
		open: 'published',
		closed: 'published',
		archived: 'archived',
		'needs-revision': 'draft',
	};
	return statusMap[firebaseStatus?.toLowerCase() || ''] || 'published';
};

const main = () => {
	console.log('🔄 Reading Firebase backup...');
	const rawData = readFileSync(INPUT_FILE, 'utf8');
	const allPolls = JSON.parse(rawData);

	console.log(`📊 Found ${allPolls.length} total polls`);

	const filteredPolls = allPolls.filter(poll => !shouldSkipCategory(poll.category));
	console.log(`🚫 Filtered out ${allPolls.length - filteredPolls.length} Next.js polls`);

	const pollsToMigrate = POLLS_TO_PROCESS
		? filteredPolls.slice(0, POLLS_TO_PROCESS)
		: filteredPolls;

	console.log(`✂️  Processing ${pollsToMigrate.length} polls...`);

	console.log('🏗️  Generating SQL statements...');
	const sql = generatePollInserts(pollsToMigrate);

	console.log(`💾 Writing to ${OUTPUT_FILE}...`);
	writeFileSync(OUTPUT_FILE, sql, 'utf8');

	console.log('✅ Migration file generated successfully!');
	console.log('');
	console.log('📝 Next steps:');
	console.log('   1. Verify category codes exist in polls_categories table');
	console.log('   2. Run: psql postgres://postgres:postgres@localhost:54322/postgres -f scripts/migration-firebase-polls.sql');
};

main();
