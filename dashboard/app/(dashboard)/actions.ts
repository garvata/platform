"use server"

import { z } from "zod";
import { redirect } from "next/navigation";

const projectSchema = z.object({
    gitUrl: z.string().url(),
    authKey: z.string()
});

type AddProjectFormState = {
    message: string
    isError: boolean
}

export async function addProject(prevState: AddProjectFormState, formData: FormData): Promise<AddProjectFormState> {
    const projectData = {
        gitUrl: formData.get('gitUrl'),
        authKey: formData.get('authKey')
    };
    const parsedData = projectSchema.safeParse(projectData);
    if (!parsedData.success) {
        return { message: parsedData.error.message, isError: true };
    }
    return { message: 'Project added successfully!', isError: false };
};
