import { drizzle } from "drizzle-orm/neon-http";

// TODO: Task 3.5 - Implement database connection and query utilities

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required");
}

export const db = drizzle(databaseUrl);

export const queries = {
	projects: {
		getAll: () => {
			console.log("TODO: Task 4.1 - Implement project CRUD operations");
			return [];
		},
		getById: (id: string) => {
			console.log(`TODO: Get project by ID: ${id}`);
			return null;
		},
		create: (data: unknown) => {
			console.log("TODO: Create project", data);
			return null;
		},
		update: (id: string, data: unknown) => {
			console.log(`TODO: Update project ${id}`, data);
			return null;
		},
		delete: (id: string) => {
			console.log(`TODO: Delete project ${id}`);
			return null;
		},
	},
	tasks: {
		getByProject: (projectId: string) => {
			console.log(`TODO: Task 4.4 - Get tasks for project ${projectId}`);
			return [];
		},
		create: (data: unknown) => {
			console.log("TODO: Create task", data);
			return null;
		},
		update: (id: string, data: unknown) => {
			console.log(`TODO: Update task ${id}`, data);
			return null;
		},
		delete: (id: string) => {
			console.log(`TODO: Delete task ${id}`);
			return null;
		},
	},
};
