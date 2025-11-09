import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account JSON
const serviceAccount = JSON.parse(
	fs.readFileSync(
		join(__dirname, "polls-d8b3d-firebase-adminsdk-cos71-910d48b66d.json"),
		"utf8"
	)
);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportPolls() {
	console.log("📥 Exporting polls collection...");

	const pollsSnapshot = await db.collection("polls").get();
	const polls = [];

	pollsSnapshot.forEach((doc) => {
		polls.push({
			firebaseId: doc.id,
			...doc.data(),
		});
	});

	const filename = `firebase-polls-backup-${new Date().toISOString().split("T")[0]}.json`;
	fs.writeFileSync(join(__dirname, filename), JSON.stringify(polls, null, 2));

	console.log(`✅ Exported ${polls.length} polls to scripts/${filename}`);
	process.exit(0);
}

exportPolls().catch((error) => {
	console.error("❌ Error:", error);
	process.exit(1);
});
