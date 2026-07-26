import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { canManageProject } from "@/lib/db/queries/project-members";
import { labels } from "@/lib/db/schema";

interface CreateLabelData {
	name: string;
	color: string;
}

export async function createLabel(
	projectId: string,
	userId: string,
	data: CreateLabelData,
) {
	if (!(await canManageProject(projectId, userId))) {
		throw new Error("You do not have permission to create project labels");
	}

	const [existingLabel] = await db
		.select({ id: labels.id })
		.from(labels)
		.where(and(eq(labels.projectId, projectId), eq(labels.name, data.name)))
		.limit(1);

	if (existingLabel) {
		throw new Error("A label with this name already exists");
	}

	const [label] = await db
		.insert(labels)
		.values({ projectId, ...data })
		.returning();

	return label;
}

export async function deleteLabel(labelId: string, userId: string) {
	const [label] = await db
		.select()
		.from(labels)
		.where(eq(labels.id, labelId))
		.limit(1);

	if (!label || !(await canManageProject(label.projectId, userId))) {
		throw new Error("You do not have permission to delete this label");
	}

	await db.delete(labels).where(eq(labels.id, labelId));
	return label;
}
